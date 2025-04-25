package com.ssafy.usedtrade.domain.chat.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChannelTotalMessageRequest {
    private String channel;
    private String messageId;
    private LocalDateTime timestamp;
}
