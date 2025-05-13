package com.ssafy.usedtrade.domain.redis.entity;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChattingTotalMessageRequest {
    private String chattingRoomId;
    private String messageId;
    private LocalDateTime timestamp;
}
