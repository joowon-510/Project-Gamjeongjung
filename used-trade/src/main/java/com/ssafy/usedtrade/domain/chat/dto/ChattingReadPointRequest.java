package com.ssafy.usedtrade.domain.chat.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChattingReadPointRequest(
        Long channelId,
        Long userId,
        LocalDateTime timestamp
) {

}
