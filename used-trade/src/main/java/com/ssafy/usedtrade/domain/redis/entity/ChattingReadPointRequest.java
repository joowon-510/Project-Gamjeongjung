package com.ssafy.usedtrade.domain.redis.entity;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChattingReadPointRequest(
        String channelId,
        String userId,
        LocalDateTime createdAt
) {

}
