package com.ssafy.usedtrade.domain.chat.repository;

import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChattingListRepository extends JpaRepository<ChattingList, Integer>, ChattingListCustom {
    Optional<ChattingList> findByBuyerIdAndPostId(Integer userId, Integer id);
}
