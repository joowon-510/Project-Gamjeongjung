package com.ssafy.usedtrade.domain.chat.repository;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.domain.chat.dto.ChatListResponse;
import com.ssafy.usedtrade.domain.chat.entity.QChattingList;
import com.ssafy.usedtrade.domain.item.entity.QSalesItem;
import com.ssafy.usedtrade.domain.user.entity.QUser;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;

@RequiredArgsConstructor
public class ChattingListCustomImpl implements ChattingListCustom {
    private final AESUtil aesUtil;
    private final JPAQueryFactory queryFactory;

    @Override
    public List<ChatListResponse> findByBuyerIdOrSellerId_toChatListResponse(
            Integer userId,
            LocalDateTime lastChatTime,
            Pageable pageable
    ) {
        // Query Entity Setting
        QChattingList chat = QChattingList.chattingList;
        QUser buyer = new QUser("buyer"); // "buyer" -> 별칭
        QUser seller = new QUser("seller"); // "seller" -> 별칭
        QSalesItem post = QSalesItem.salesItem;

        // case when 구현
        Expression<String> opponentNickname = new CaseBuilder()
                .when(chat.buyerId.eq(userId)).then(seller.nickname)
                .otherwise(buyer.nickname);

        // dto의 필요한 데이터만 get
        List<Tuple> result = queryFactory
                .select(
                        chat.id,
                        opponentNickname,
                        post.title,
                        post.id
                )
                .from(chat)
                .rightJoin(buyer).on(chat.buyerId.eq(buyer.id))
                .rightJoin(seller).on(chat.sellerId.eq(seller.id))
                .leftJoin(post).on(chat.postId.eq(post.id))
                .where(
                        chat.buyerId.eq(userId).or(chat.sellerId.eq(userId)),
                        lastChatTime != null ? chat.lastChatTime.before(lastChatTime) : null)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize() + 1)
                .orderBy(chat.lastChatTime.desc(), chat.id.desc())
                .fetch();

        // return dto setting
        return result.stream().map(dto -> {
            String encryptedRoomId = aesUtil.encrypt(String.valueOf(dto.get(chat.id)));
            String nickname = dto.get(opponentNickname);
            String title = dto.get(post.title); // fetch join or projection 필요
            String postId = String.valueOf(dto.get(post.id));

            return ChatListResponse.builder()
                    .postId(postId)
                    .roomId(encryptedRoomId)
                    .chattingUserNickname(nickname) // 임시
                    .nonReadCount(0)
                    .lastMessage("")
                    .postTitle(title)
                    .build();
        }).toList();
    }
}
