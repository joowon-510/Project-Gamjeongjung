package com.ssafy.usedtrade.domain.websocket.redis.entity;

import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MessageDetail {
    String messageId;
    ChatMessageDto message;
}
