package com.ssafy.usedtrade.domain.chat.dto;

import java.time.LocalDateTime;
import lombok.Builder;


@Builder
public record WebsocketSessionDto(
        Integer userId,
        String sessionId,
        LocalDateTime timestamp
) {

}