package com.ssafy.usedtrade.domain.chat.dto;

import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import lombok.Builder;

@Builder
public record ChatListResponse(
        int roomId,
        String otherName,
        int nonReadCount,
        String lastMessage
) {
    public static ChatListResponse toDto(ChattingList entity) {
        return ChatListResponse.builder()
                .roomId(entity.getId())
                .otherName("otherName")
                .nonReadCount(1)
                .lastMessage("otherName")
                .build();
    }
}
