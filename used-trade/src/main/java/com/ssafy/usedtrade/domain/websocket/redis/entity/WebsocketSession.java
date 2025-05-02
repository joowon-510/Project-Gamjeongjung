package com.ssafy.usedtrade.domain.websocket.redis.entity;

import lombok.Builder;


@Builder
public record WebsocketSession(
        String userId,
        String sessionId
) {

}