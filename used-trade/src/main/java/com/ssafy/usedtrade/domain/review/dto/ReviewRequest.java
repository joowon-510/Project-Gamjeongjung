package com.ssafy.usedtrade.domain.review.dto;

import lombok.Builder;

@Builder
public record ReviewRequest(
        Integer itemId,
        String content,
        float stars
) {
}
