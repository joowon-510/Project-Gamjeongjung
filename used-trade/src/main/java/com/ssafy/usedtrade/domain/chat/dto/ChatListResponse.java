package com.ssafy.usedtrade.domain.chat.dto;

import lombok.Builder;

@Builder
public record ChatListResponse(
        String postId,
        String roomId,
        String chattingUserNickname,
        int nonReadCount,
        String lastMessage,
        String postTitle
) {
}
