package com.ssafy.usedtrade.domain.chat.service;

import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.domain.chat.dto.ChatContentResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatListResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatRoomCreateRequest;
import com.ssafy.usedtrade.domain.chat.entity.ChattingContent;
import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import com.ssafy.usedtrade.domain.chat.repository.ChattingContentRepository;
import com.ssafy.usedtrade.domain.chat.repository.ChattingListRepository;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.repository.ItemSalesRepository;
import com.ssafy.usedtrade.domain.user.service.UserService;
import com.ssafy.usedtrade.domain.websocket.redis.entity.ChattingReadPointRequest;
import com.ssafy.usedtrade.domain.websocket.redis.service.ChattingReadPointService;
import com.ssafy.usedtrade.domain.item.service.SalesItemService;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChattingListRepository chattingListRepository;
    private final ChattingContentRepository chattingContentRepository;
    private final ChattingReadPointService chattingReadPointService;
    private final ItemSalesRepository itemSalesRepository;
    private final UserService userService;
    private final AESUtil aesUtil;
    private final SalesItemService salesItemService;

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
                Sort.by(Sort.Direction.DESC, "lastChatTime"));

        // 나의 id가 traderId or postId면 all get
        if (lastChatTime == null) {
            return chattingListRepository.findByBuyerIdOrSellerId(
                    userId,
                    userId,
                    pageable
            ).map(entity -> {
                // TODO: REDIS로 세션 접속했던 시간 대비 해서 count
                int nonReadCount =
                        chattingContentRepository.countUnreadMessagesAfterDate(
                                entity.getId(),
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
                // TODO: Redis ZSet으로 마지막 메세지 보여주기
                String lastMessage = chattingContentRepository.findTopByChattingListIdOrderByCreatedAtDesc(
                                entity.getId())
                        .orElse(new ChattingContent(
                                null,
                                null,
                                null,
                                "메세지가 존재하지 않습니다.",
                                null))
                        .getContents();

                return ChatListResponse.builder()
                        .roomId(aesUtil.encrypt(String.valueOf(entity.getId())))
                        .chattingUserNickname(userNickname)
                        .nonReadCount(nonReadCount)
                        .lastMessage(lastMessage)
                        .postTitle(
                                itemSalesRepository.findById(entity.getPostId())
                                        .orElseThrow(() -> new IllegalArgumentException("해당 post가 없습니다."))
                                        .getTitle()
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
            // TODO: REDIS로 세션 접속했던 시간 대비 해서 count
            int nonReadCount =
                    chattingContentRepository.countUnreadMessagesAfterDate(
                            entity.getId(),
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
            // TODO: Redis ZSet으로 마지막 메세지 보여주기
            String lastMessage = chattingContentRepository.findTopByChattingListIdOrderByCreatedAtDesc(entity.getId())
                    .orElse(new ChattingContent(
                            null,
                            null,
                            null,
                            "메세지가 존재하지 않습니다.",
                            null))
                    .getContents();

            return ChatListResponse.builder()
                    .roomId(aesUtil.encrypt(String.valueOf(entity.getId())))
                    .chattingUserNickname(userNickname)
                    .nonReadCount(nonReadCount)
                    .lastMessage(lastMessage)
                    .postTitle(
                            itemSalesRepository.findById(entity.getPostId())
                                    .orElseThrow(() -> new IllegalArgumentException("해당 post가 없습니다."))
                                    .getTitle()
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
         *  2. Mysql -> Redis 사용
         *  3. Test 값 -> Redis 적용으로 동적으로
         *  4. front에서 시간을 비교해서 적용가능하도록 구현
         *  5. 최근 chat 참가 기준으로 전체 return 후 진행
         *  - 부가
         *  4. 채팅 list에 동적으로 가능인 지도 front와 상의
         * */
        Integer decryptRoomId = Integer.parseInt(aesUtil.decrypt(roomId));

        // 해당 roomId로 해당 유저의 입장 가능성 판단
        ChattingList chattingList = chattingListRepository.findById(decryptRoomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 없습니다."));

        if (chattingList.getBuyerId() != userId && chattingList.getSellerId() != userId) {
            throw new IllegalArgumentException("해당 유저는 해당 채팅방에 입장할 수 없습니다.");
        }

        PageRequest pageable =
                PageRequest.of(
                        0,
                        10,
                        Sort.by(Sort.Direction.DESC, "createdAt"));

        if (createdAt == null) {
            return chattingContentRepository.findAllByChattingListId(
                    decryptRoomId,
                    pageable
            ).map(entity ->
                    ChatContentResponse.builder()
                            .message(entity.getContents())
                            .toSend(entity.getUserId().equals(userId))
                            .createdAt(entity.getCreatedAt())
                            .build());
        }

        // 입장 후, 해당 페이지에 메세지 제공
        return chattingContentRepository.findAllByChattingListIdAndCreatedAtBefore(
                decryptRoomId,
                createdAt,
                pageable
        ).map(entity ->
                ChatContentResponse.builder()
                        .message(entity.getContents())
                        .toSend(entity.getUserId().equals(userId))
                        .createdAt(entity.getCreatedAt())
                        .build());
    }

    public void createChatRoom(Integer userId, ChatRoomCreateRequest createRequest) {
        // 게시물 id로 게시글 조회
        SalesItem salesItem =
                itemSalesRepository.findById(createRequest.salesItemId())
                        .orElseThrow(() -> new IllegalArgumentException("존재하는 물품이 없습니다."));

        // 게시글에서 판매자 id 조회
        chattingListRepository.save(
                ChattingList.builder()
                        .postId(salesItem.getId())
                        .sellerId(salesItem.getUserId())
                        .buyerId(userId)
                        .lastChatTime(LocalDateTime.now())
                        .build());
    }

    public void deleteMyChatRoom(Integer userId, String roomId) {
        // 암호화 userId -> 복호화
        Integer decryptRoomId = Integer.parseInt(aesUtil.decrypt(roomId));

        ChattingList chattingList = chattingListRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 없습니다."));

        if (chattingList.getSellerId() != userId && chattingList.getBuyerId() != userId) {
            throw new IllegalArgumentException("해당 유저는 해당 채팅방을 삭제할 수 없습니다.");
        }

        chattingListRepository.deleteById(decryptRoomId);
    }
}
