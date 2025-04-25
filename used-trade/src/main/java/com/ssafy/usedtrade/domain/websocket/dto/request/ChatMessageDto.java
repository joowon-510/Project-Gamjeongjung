package com.ssafy.usedtrade.domain.websocket.dto.request;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChatMessageDto(
        String type,
        String roomId,
        String sender,
        String message,
        LocalDateTime createdAt
) {
}
