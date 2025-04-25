package com.ssafy.usedtrade.domain.chat.repository;

import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChattingListRepository extends JpaRepository<ChattingList, Integer> {
    Slice<ChattingList> findByTraderIdOrPostId(@NotNull Integer traderId, @NotNull Integer postId, Pageable pageable);

    Slice<ChattingList> findByTraderIdOrPostIdAndLastChatTimeLessThan(
            Integer trader, Integer poster,
            LocalDateTime lastChatTime, Pageable pageable);
}
