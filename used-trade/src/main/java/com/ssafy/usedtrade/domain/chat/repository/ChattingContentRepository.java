package com.ssafy.usedtrade.domain.chat.repository;

import com.ssafy.usedtrade.domain.chat.entity.ChattingContent;
import io.lettuce.core.dynamic.annotation.Param;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ChattingContentRepository extends JpaRepository<ChattingContent, Integer> {
    Optional<ChattingContent> findTopByChattingListIdOrderByCreatedAtDesc(Integer roomId);

    Slice<ChattingContent> findAllByChattingListId(Integer roomId, PageRequest lastChatTime);

    Slice<ChattingContent> findAllByChattingListIdAndCreatedAtBefore(
            Integer roomId,
            LocalDateTime lastMessageAt,
            PageRequest pageable
    );

    @Query("""
                SELECT COUNT(c)
                    FROM ChattingContent c
                    WHERE c.chattingList.id = :roomId
                        AND c.createdAt > :sinceDate
            """)
    int countUnreadMessagesAfterDate(@Param("roomId") Integer roomId, @Param("sinceDate") LocalDateTime sinceDate);
}
