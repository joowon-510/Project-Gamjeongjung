package com.ssafy.usedtrade.domain.chat.repository;

import com.ssafy.usedtrade.domain.chat.entity.ChattingContent;
import java.time.LocalDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChattingContentRepository extends JpaRepository<ChattingContent, Integer> {
    Slice<ChattingContent> findAllByChattingListId(Integer roomId, PageRequest lastChatTime);

    Slice<ChattingContent> findAllByChattingListIdAndCreatedAtBefore(
            Integer roomId,
            LocalDateTime lastMessageAt,
            PageRequest pageable
    );
}
