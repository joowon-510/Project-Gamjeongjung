package com.ssafy.usedtrade.domain.websocket.dto.request;

import java.time.LocalDateTime;

public record ChatReadDto(
        String type,
        String roomId,
        String receiver,
        LocalDateTime receiveAt
) {
}
