package com.ssafy.usedtrade.domain.websocket.dto.request;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChatReadDto(
        String type,
        String roomId,
        String receiver,
        LocalDateTime receiveAt
) {
}
