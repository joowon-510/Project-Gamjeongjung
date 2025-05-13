package com.ssafy.usedtrade.domain.chat.repository;

import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChattingListRepository extends JpaRepository<ChattingList, Integer> {
    Slice<ChattingList> findByBuyerIdOrSellerId(@NotNull Integer traderId, @NotNull Integer postId, Pageable pageable);

    Slice<ChattingList> findByBuyerIdOrSellerIdAndLastChatTimeLessThan(
            Integer trader, Integer poster,
            LocalDateTime lastChatTime, Pageable pageable);

    Optional<ChattingList> findByBuyerIdAndPostId(Integer userId, Integer id);
}
