package com.ssafy.usedtrade.domain.redis.entity;

import lombok.Builder;


@Builder
public record WebsocketSession(
        String userId,
        String sessionId
) {

}