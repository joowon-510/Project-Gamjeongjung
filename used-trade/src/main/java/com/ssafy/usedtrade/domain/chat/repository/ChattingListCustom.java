package com.ssafy.usedtrade.domain.chat.repository;

import com.ssafy.usedtrade.domain.chat.dto.ChatListResponse;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface ChattingListCustom {
    List<ChatListResponse> findByBuyerIdOrSellerId_toChatListResponse(
            @NotNull Integer postId, LocalDateTime lastChatTime, @NotNull Pageable pageable);
}
