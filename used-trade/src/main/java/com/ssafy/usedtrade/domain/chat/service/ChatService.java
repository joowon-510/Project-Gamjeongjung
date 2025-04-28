package com.ssafy.usedtrade.domain.chat.service;

import com.ssafy.usedtrade.domain.chat.dto.ChatContentResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatListResponse;
import com.ssafy.usedtrade.domain.chat.dto.ChatRoomCreateRequest;
import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import com.ssafy.usedtrade.domain.chat.repository.ChattingContentRepository;
import com.ssafy.usedtrade.domain.chat.repository.ChattingListRepository;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.service.SalesItemService;
import java.time.LocalDateTime;
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
    private final SalesItemService salesItemService;

    public Slice<ChatListResponse> findAllMyChatRoom(Integer userId, LocalDateTime lastChatTime) {
        /*
         * TODO:
         *  - 일단 Test 기본 값으로 구현
         *  - 필수
         *  1. chatRoomId 암호화
         *  2. Mysql -> Redis 사용
         *  3. Test 값 -> Redis 적용으로 동적으로
         *  - 부가
         *  4. 채팅 list에 동적으로 가능인 지도 front와 상의
         * */

        Pageable pageable = PageRequest.of(
                0,
                10,
                Sort.by(Sort.Direction.DESC, "lastChatTime"));

        // 나의 id가 traderId or postId면 all get
        if (lastChatTime == null) {
            return chattingListRepository.findByTraderIdOrPostId(
                    userId,
                    userId,
                    pageable
            ).map(ChatListResponse::toDto);
        }

        // 해당 List를 DTO로 변환 후 return
        return chattingListRepository.findByTraderIdOrPostIdAndLastChatTimeLessThan(
                userId, userId, lastChatTime, pageable
        ).map(ChatListResponse::toDto);
    }

    public Slice<ChatContentResponse> findAllMyChat(
            Integer userId,
            Integer roomId,
            LocalDateTime createdAt
    ) {
        /*
         * TODO:
         *  - 일단 Test 기본 값으로 구현
         *  - 필수
         *  1. chatRoomId 복호화
         *  2. Mysql -> Redis 사용
         *  3. Test 값 -> Redis 적용으로 동적으로
         *  4. front에서 시간을 비교해서 적용가능하도록 구현
         *  5. 최근 chat 참가 기준으로 전체 return 후 진행
         *  - 부가
         *  4. 채팅 list에 동적으로 가능인 지도 front와 상의
         * */
        // 해당 roomId로 해당 유저의 입장 가능성 판단
        ChattingList chattingList = chattingListRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 없습니다."));

        if (chattingList.getTraderId() != userId && chattingList.getPostId() != userId) {
            throw new IllegalArgumentException("해당 유저는 해당 채팅방에 입장할 수 없습니다.");
        }

        PageRequest pageable =
                PageRequest.of(
                        0,
                        10,
                        Sort.by(Sort.Direction.DESC, "createdAt"));

        if (createdAt == null) {
            return chattingContentRepository.findAllByChattingListId(
                    roomId,
                    pageable
            ).map(ChatContentResponse::toDto);
        }

        // 입장 후, 해당 페이지에 메세지 제공
        return chattingContentRepository.findAllByChattingListIdAndCreatedAtBefore(
                roomId,
                createdAt,
                pageable
        ).map(ChatContentResponse::toDto);
    }

    public void createChatRoom(Integer userId, ChatRoomCreateRequest createRequest) {
        // 게시물 id로 게시글 조회
        /*
         * TODO: createRequest의 salesItemId로 DB 조회 후 salesItem 가져오기
         * */
        SalesItem salesItem = salesItemService.testGetItem();
        // 게시글에서 판매자 id 조회
        chattingListRepository.save(
                ChattingList.builder()
                        .traderId(salesItem.getUserId())
                        .postId(userId)
                        .lastChatTime(LocalDateTime.now())
                        .build());
    }

    public void deleteMyChatRoom(Integer userId, Integer roomId) {
        /*
         * TODO:
         *  - 일단 Test 기본 값으로 구현
         *  - 필수
         *  1. chatRoomId 복호화
         * */
        ChattingList chattingList = chattingListRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 없습니다."));

        if (chattingList.getTraderId() != userId && chattingList.getPostId() != userId) {
            throw new IllegalArgumentException("해당 유저는 해당 채팅방을 삭제할 수 없습니다.");
        }

        chattingListRepository.deleteById(roomId);
    }
}
