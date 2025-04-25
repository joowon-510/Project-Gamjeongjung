package com.ssafy.usedtrade.domain.chat.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChannelTotalMessageResponse {
    private LocalDateTime timestamp;
    private String messageId;
}
