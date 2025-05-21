package com.ssafy.usedtrade.domain.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.ssafy.usedtrade.domain.redis.entity.ChattingReadPointRequest;
import com.ssafy.usedtrade.domain.redis.entity.ChattingTotalMessageRequest;
import com.ssafy.usedtrade.domain.redis.entity.MessageDetail;
import com.ssafy.usedtrade.domain.redis.service.ChattingReadPointService;
import com.ssafy.usedtrade.domain.redis.service.ChattingTotalMessageService;
import com.ssafy.usedtrade.domain.redis.service.MessageDetailService;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
    private final ChattingReadPointService chattingReadPointService;
    private final ItemSalesRepository itemSalesRepository;
    private final AESUtil aesUtil;
    private final ChattingContentRepository chattingContentRepository;

    private final ChattingTotalMessageService chattingTotalMessageService;
    private final MessageDetailService messageDetailService;
    private final ObjectMapper objectMapper;

    public Slice<ChatListResponse> findAllMyChatRoom(Integer userId, LocalDateTime lastChatTime) {
        /*
         * TODO:
         *  - 필수
         *  1. Redis, RDB 유동적인 환경에서의 라스트 message 관련 로직 구현
         * */

        Pageable pageable = PageRequest.of(
                0,
                10,
                Sort.by(Sort.Direction.DESC, "lastChatTime")
                        .and(Sort.by(Sort.Direction.DESC, "id")));

        // 나의 id가 traderId or postId면 all get
        List<ChatListResponse> list = chattingListRepository
                .findByBuyerIdOrSellerId_toChatListResponse(userId, lastChatTime, pageable)
                .stream().map(chatListResponse -> {
                    return ChatListResponse.builder()
                            .postId(chatListResponse.postId())
                            .roomId(chatListResponse.roomId())
                            .chattingUserNickname(chatListResponse.chattingUserNickname())
                            .nonReadCount(
                                    getNonReadCount(userId, chatListResponse))
                            .lastMessage(
                                    getLastMessage(chatListResponse))
                            .postTitle(chatListResponse.postTitle())
                            .build();
                })
                .toList();

        // 다음 유무
        boolean hasNext = list.size() > pageable.getPageSize();
        if (hasNext) {
            list.remove(pageable.getPageSize());
        }

        return new SliceImpl<>(list, pageable, hasNext);
    }

    /*
     * TODO:
     *  - 필수
     *  1. Redis, RDB 유동적인 환경에서의 라스트 message 관련 로직 구현
     * */
    public Slice<ChatContentResponse> findAllMyChat(
            Integer userId,
            String roomId,
            LocalDateTime createdAt
    ) {
        Integer decryptRoomId = Integer.parseInt(aesUtil.decrypt(roomId));

        // 해당 roomId로 해당 유저의 입장 가능성 판단
        ChattingList chattingList =
                chattingListRepository.getReferenceById(decryptRoomId);

        if (chattingList.getBuyerId() != userId && chattingList.getSellerId() != userId) {
            throw new IllegalArgumentException("해당 유저는 해당 채팅방에 입장할 수 없습니다.");
        }

        // +9
        // 최신순 메시지 ID 최대 100개 조회
        List<String> messageList = chattingTotalMessageService.multiGetMessage(
                roomId,
                createdAt == null
                        ? Double.MAX_VALUE
                        : Timestamp.valueOf(createdAt.plusHours(9)).getTime() - 1);

        // 비어 있다면, rdb -> redis + redis에서 다시 가져오기
        if (messageList.isEmpty()) {
            List<ChattingContent> rdbChattingList =
                    chattingContentRepository.findAllByChattingListId(
                            decryptRoomId);

            for (ChattingContent chattingContent : rdbChattingList) {
                chattingTotalMessageService.save(
                        ChattingTotalMessageRequest.builder()
                                .chattingRoomId(roomId)
                                .messageId(chattingContent.getCreatedAt() + "_" + chattingContent.getUserId())
                                .timestamp(chattingContent.getCreatedAt())
                                .build()
                );

                messageDetailService.save(MessageDetail.builder()
                        .messageId(chattingContent.getCreatedAt() + "_" + chattingContent.getUserId())
                        .message(ChatMessageDto.builder()
                                .type("MESSAGE")
                                .roomId(aesUtil.encrypt(String.valueOf(chattingContent.getChattingList().getId())))
                                .sender(String.valueOf(chattingContent.getUserId()))
                                .message(chattingContent.getContents())
                                .createdAt(chattingContent.getCreatedAt())
                                .build())
                        .build()
                );
            }

            messageList = chattingTotalMessageService.multiGetMessage(
                    roomId,
                    createdAt == null
                            ? Double.MAX_VALUE
                            : Timestamp.valueOf(createdAt.plusHours(9)).getTime() - 1);
        }

        // +9
        boolean hasMoreMessage =
                chattingTotalMessageService.hasMoreMessage(
                        roomId,
                        createdAt == null
                                ? Double.MAX_VALUE
                                : Timestamp.valueOf(createdAt.plusHours(9)).getTime() - 1
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
                ChatMessageDto dto =
                        objectMapper.readValue(json, ChatMessageDto.class);
                chatMessages.add(ChatContentResponse.builder()
                        .message(dto.message())
                        .toSend(dto.sender().equals(String.valueOf(userId)))
                        .createdAt(dto.createdAt())
                        .build());
            } catch (Exception e) {
                log.warn("역직렬화 실패 - messageId: {}", messageList.toArray()[i], e);
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
            LocalDateTime now = LocalDateTime.now();

            // +9
            ChattingList chattingList = chattingListRepository.save(
                    ChattingList.builder()
                            .postId(salesItem.getId())
                            .sellerId(salesItem.getUserId())
                            .buyerId(userId)
                            .lastChatTime(now.plusHours(9))
                            .build());

            // 초기 읽기 시간 세팅
            chattingReadPointService.saveOrUpdate(ChattingReadPointRequest.builder()
                            .userId(String.valueOf(salesItem.getUserId()))
                            .channelId(String.valueOf(salesItem.getId()))
                            .createdAt(now)
                            .build(),
                    false);
            chattingReadPointService.saveOrUpdate(ChattingReadPointRequest.builder()
                            .userId(String.valueOf(userId))
                            .channelId(String.valueOf(salesItem.getId()))
                            .createdAt(now)
                            .build(),
                    false);

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

    private String getLastMessage(ChatListResponse chatListResponse) {
        String message = messageDetailService.find(
                chattingTotalMessageService.getLatestMessageId(
                        chatListResponse.roomId())).message();

        // 메세지 없으면 RDB -> Redis 저장 후, RDB 마지막 데이터를 Message에 저장
        if (message.equals("메세지가 존재하지 않습니다!")) {
            List<ChattingContent> rdbChattingList =
                    chattingContentRepository.findAllByChattingListId(
                            Integer.valueOf(chatListResponse.roomId()));

            for (ChattingContent chattingContent : rdbChattingList) {
                chattingTotalMessageService.save(
                        ChattingTotalMessageRequest.builder()
                                .chattingRoomId(chatListResponse.roomId())
                                .messageId(chattingContent.getCreatedAt() + "_" + chattingContent.getUserId())
                                .timestamp(chattingContent.getCreatedAt())
                                .build()
                );

                messageDetailService.save(MessageDetail.builder()
                        .messageId(chattingContent.getCreatedAt() + "_" + chattingContent.getUserId())
                        .message(ChatMessageDto.builder()
                                .type("MESSAGE")
                                .roomId(aesUtil.encrypt(String.valueOf(chattingContent.getChattingList().getId())))
                                .sender(String.valueOf(chattingContent.getUserId()))
                                .message(chattingContent.getContents())
                                .createdAt(chattingContent.getCreatedAt())
                                .build())
                        .build()
                );
            }

            message = rdbChattingList.get(rdbChattingList.size() - 1).getContents();
        }

        return message;
    }

    private int getNonReadCount(Integer userId, ChatListResponse chatListResponse) {
        return (int) chattingTotalMessageService.count(
                chatListResponse.roomId(),
                chattingReadPointService.find(
                        ChattingReadPointRequest.builder()
                                .channelId(aesUtil.decrypt(chatListResponse.roomId()))
                                .userId(String.valueOf(userId))
                                .build()));
    }

    private String redirectUrlExistChatting(Optional<ChattingList> optionalChattingList) {
        return "/" + aesUtil.encrypt(String.valueOf(optionalChattingList.get().getId()));
    }
}
