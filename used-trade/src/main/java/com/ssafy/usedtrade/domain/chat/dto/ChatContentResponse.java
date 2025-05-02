package com.ssafy.usedtrade.domain.chat.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChatContentResponse(
        boolean toSend,
        String message,
        LocalDateTime createdAt
) {
}
