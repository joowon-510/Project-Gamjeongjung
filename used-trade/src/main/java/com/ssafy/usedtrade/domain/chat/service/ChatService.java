package com.ssafy.usedtrade.domain.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.domain.chat.dto.ChatContentResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatListResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatRoomCreateRequest;
import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import com.ssafy.usedtrade.domain.chat.repository.ChattingContentRepository;
import com.ssafy.usedtrade.domain.chat.repository.ChattingListRepository;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.repository.ItemSalesRepository;
import com.ssafy.usedtrade.domain.redis.entity.ChattingReadPointRequest;
import com.ssafy.usedtrade.domain.redis.service.ChattingReadPointService;
import com.ssafy.usedtrade.domain.redis.service.ChattingTotalMessageService;
import com.ssafy.usedtrade.domain.redis.service.MessageDetailService;
import com.ssafy.usedtrade.domain.user.service.UserService;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChattingListRepository chattingListRepository;
    private final ChattingContentRepository chattingContentRepository;
    private final ChattingReadPointService chattingReadPointService;
    private final ItemSalesRepository itemSalesRepository;
    private final UserService userService;
    private final AESUtil aesUtil;
    private final ChattingTotalMessageService chattingTotalMessageService;
    private final MessageDetailService messageDetailService;
    private final ObjectMapper objectMapper;

    public Slice<ChatListResponse> findAllMyChatRoom(Integer userId, LocalDateTime lastChatTime) {
        /*
         * TODO:
         *  - 필수
         *  1. Redis에 값 유무 확인, 없으면 RDB에서 가져오기
         *  2. Redis에 라스트 message
         *      + 세션 시간 이후 값을 count
         *      + 해당 유저의 이름 return
         * */

        Pageable pageable = PageRequest.of(
                0,
                10,
                Sort.by(Sort.Direction.DESC, "lastChatTime")
                        .and(Sort.by(Sort.Direction.DESC, "id")));

        // 나의 id가 traderId or postId면 all get
        if (lastChatTime == null) {
            return chattingListRepository.findByBuyerIdOrSellerId(
                    userId,
                    userId,
                    pageable
            ).map(entity -> {
                // redis로 안읽은 메세지 갯수 return
                long nonReadCount =
                        chattingTotalMessageService.count(
                                aesUtil.encrypt(String.valueOf(entity.getId())),
                                chattingReadPointService.find(
                                        ChattingReadPointRequest.builder()
                                                .channelId(String.valueOf(entity.getId()))
                                                .userId(String.valueOf(userId))
                                                .build()));
                /*
                 * TODO: 현재 user 이름을 위해 db 참조
                 *  N + 1이 되는 상황 제거해보기
                 * */
                String userNickname = userService.getUserNameById(
                        !Objects.equals(entity.getBuyerId(), userId) ?
                                entity.getBuyerId() :
                                entity.getSellerId()
                );

                // redis로 마지막 메세지 get
                ChatMessageDto chatMessageDto = messageDetailService.find(
                        chattingTotalMessageService.getLatestMessageId(
                                aesUtil.encrypt(String.valueOf(entity.getId()))));

                return ChatListResponse.builder()
                        .roomId(aesUtil.encrypt(String.valueOf(entity.getId())))
                        .chattingUserNickname(userNickname)
                        .nonReadCount((int) nonReadCount)
                        .lastMessage(chatMessageDto.message())
                        .postTitle(
                                itemSalesRepository.getReferenceById(entity.getPostId()).getTitle()
                        )
                        .build();
            });
        }

        // 해당 List를 DTO로 변환 후 return
        return chattingListRepository.findByBuyerIdOrSellerIdAndLastChatTimeLessThan(
                userId,
                userId,
                lastChatTime,
                pageable
        ).map(entity -> {
            // redis로 안읽은 메세지 갯수 return
            long nonReadCount = chattingTotalMessageService.count(
                    aesUtil.encrypt(String.valueOf(entity.getId())),
                    chattingReadPointService.find(
                            ChattingReadPointRequest.builder()
                                    .channelId(String.valueOf(entity.getId()))
                                    .userId(String.valueOf(userId))
                                    .build()));

            /*
             * TODO: 현재 user 이름을 위해 db 참조
             *  N + 1이 되는 상황 제거해보기
             * */
            String userNickname = userService.getUserNameById(
                    !Objects.equals(entity.getBuyerId(), userId) ?
                            entity.getBuyerId() :
                            entity.getSellerId()
            );
            //redis에서 마지막 메세지 get
            ChatMessageDto chatMessageDto = messageDetailService.find(
                    chattingTotalMessageService.getLatestMessageId(
                            aesUtil.encrypt(String.valueOf(entity.getId()))));

            return ChatListResponse.builder()
                    .roomId(aesUtil.encrypt(String.valueOf(entity.getId())))
                    .chattingUserNickname(userNickname)
                    .nonReadCount((int) nonReadCount)
                    .lastMessage(chatMessageDto.message())
                    .postTitle(
                            itemSalesRepository.getReferenceById(entity.getPostId()).getTitle()
                    )
                    .build();
        });
    }

    public Slice<ChatContentResponse> findAllMyChat(
            Integer userId,
            String roomId,
            LocalDateTime createdAt
    ) {
        /*
         * TODO:
         *  - 일단 Test 기본 값으로 구현
         *  - 필수
         *  2. Test 값 -> Redis 적용으로 동적으로
         *  3. front에서 시간을 비교해서 적용가능하도록 구현
         *  4. 최근 chat 참가 기준으로 전체 return 후 진행
         *  - 부가
         *  5. 채팅 list에 동적으로 가능인 지도 front와 상의
         * */
        Integer decryptRoomId = Integer.parseInt(aesUtil.decrypt(roomId));

        // 해당 roomId로 해당 유저의 입장 가능성 판단
        ChattingList chattingList =
                chattingListRepository.getReferenceById(decryptRoomId);

        if (chattingList.getBuyerId() != userId && chattingList.getSellerId() != userId) {
            throw new IllegalArgumentException("해당 유저는 해당 채팅방에 입장할 수 없습니다.");
        }

        // 최신순 메시지 ID 최대 100개 조회
        List<String> messageList = chattingTotalMessageService.multiGetMessage(
                roomId,
                createdAt == null
                        ? Double.MAX_VALUE
                        : Timestamp.valueOf(createdAt).getTime() - 1);

        boolean hasMoreMessage =
                chattingTotalMessageService.hasMoreMessage(
                        roomId,
                        createdAt == null
                                ? Double.MAX_VALUE
                                : Timestamp.valueOf(createdAt).getTime() - 1
                );

        // Redis에서 메시지 JSON 한꺼번에 조회
        List<ChatContentResponse> chatMessages = new ArrayList<>();

        int i = 0;
        for (String json : messageList) {
            if (json == null) {
                i++;
                continue;
            }
            try {
                ChatMessageDto dto = objectMapper.readValue(json, ChatMessageDto.class);
                chatMessages.add(ChatContentResponse.builder()
                        .message(dto.message())
                        .toSend(dto.sender().equals(String.valueOf(userId)))
                        .createdAt(dto.createdAt())
                        .build());
            } catch (Exception e) {
                log.warn("❌ 역직렬화 실패 - messageId: {}", messageList.toArray()[i], e);
            }
            i++;
        }

        // Slice 형태로 응답
        return new SliceImpl<>(
                chatMessages,
                PageRequest.of(0, 100),
                hasMoreMessage);
    }

    public String createChatRoom(Integer userId, ChatRoomCreateRequest createRequest) {
        // 게시물 id로 게시글 조회
        SalesItem salesItem =
                itemSalesRepository.findById(createRequest.salesItemId())
                        .orElseThrow(() -> new IllegalArgumentException("존재하는 물품이 없습니다."));

        // 채팅 요청 유저 id + 게시물 id로 존재여부 판단
        Optional<ChattingList> optionalChattingList =
                chattingListRepository.findByBuyerIdAndPostId(userId, salesItem.getId());

        if (optionalChattingList.isEmpty()) {
            ChattingList chattingList = chattingListRepository.save(
                    ChattingList.builder()
                            .postId(salesItem.getId())
                            .sellerId(salesItem.getUserId())
                            .buyerId(userId)
                            .lastChatTime(LocalDateTime.now())
                            .build());

            // 초기 읽기 시간 세팅
            chattingReadPointService.saveOrUpdate(ChattingReadPointRequest.builder()
                    .userId(String.valueOf(salesItem.getUserId()))
                    .channelId(String.valueOf(salesItem.getId()))
                    .createdAt(LocalDateTime.now())
                    .build());
            chattingReadPointService.saveOrUpdate(ChattingReadPointRequest.builder()
                    .userId(String.valueOf(userId))
                    .channelId(String.valueOf(salesItem.getId()))
                    .createdAt(LocalDateTime.now())
                    .build());

            // 생성된 채팅방의 id를 return
            return redirectUrlExistChatting(Optional.of(chattingList));
        }

        return redirectUrlExistChatting(optionalChattingList);
    }

    public void deleteMyChatRoom(Integer userId, String roomId) {
        // 암호화 userId -> 복호화
        Integer decryptRoomId = Integer.parseInt(aesUtil.decrypt(roomId));

        ChattingList chattingList = chattingListRepository.findById(decryptRoomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 없습니다."));

        if (chattingList.getSellerId() != userId && chattingList.getBuyerId() != userId) {
            throw new IllegalArgumentException("해당 유저는 해당 채팅방을 삭제할 수 없습니다.");
        }

        chattingListRepository.deleteById(decryptRoomId);
    }

    public LocalDateTime findReadTime(Integer userId, String roomId) {
        Integer decryptRoomId = Integer.parseInt(aesUtil.decrypt(roomId));

        Map<Object, Object> maps =
                chattingReadPointService.findAll(String.valueOf(decryptRoomId));

        for (Map.Entry<Object, Object> entry : maps.entrySet()) {
            if (userId != Integer.parseInt(entry.getKey().toString())) {
                return LocalDateTime.parse(entry.getValue().toString());
            }
        }

        return null;
    }

    private String redirectUrlExistChatting(Optional<ChattingList> optionalChattingList) {
        return "/" + aesUtil.encrypt(String.valueOf(optionalChattingList.get().getId()));
    }
}
