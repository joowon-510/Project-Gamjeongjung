package com.ssafy.usedtrade.domain.chat.dto;

import com.ssafy.usedtrade.domain.chat.entity.ChattingContent;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ChatContentResponse(
        Integer senderId,
        String message,
        LocalDateTime createdAt
) {

    public static ChatContentResponse toDto(ChattingContent chattingContent) {
        return ChatContentResponse.builder()
                .senderId(chattingContent.getUserId())
                .message(chattingContent.getContents())
                .createdAt(chattingContent.getCreatedAt())
                .build();
    }
}
