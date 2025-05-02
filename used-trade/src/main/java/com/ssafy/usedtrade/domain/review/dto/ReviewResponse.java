package com.ssafy.usedtrade.domain.review.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ReviewResponse(
        String content,
        float stars,
        LocalDateTime createdAt
) {
}
