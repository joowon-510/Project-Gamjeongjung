package com.ssafy.usedtrade.domain.redis.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChannelTotalMessageResponse {
    private LocalDateTime timestamp;
    private String messageId;
}
