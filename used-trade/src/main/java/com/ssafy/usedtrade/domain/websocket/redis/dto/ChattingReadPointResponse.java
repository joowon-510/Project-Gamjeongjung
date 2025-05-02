package com.ssafy.usedtrade.domain.websocket.redis.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChattingReadPointResponse {
    private Long channelId;
    private Long userId;
    private LocalDateTime timestamp;
}
