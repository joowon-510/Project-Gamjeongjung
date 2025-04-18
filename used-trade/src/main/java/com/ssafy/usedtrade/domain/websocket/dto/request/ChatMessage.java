package com.ssafy.usedtrade.domain.websocket.dto.request;

public record ChatMessage(String roomId, String sender, String message) {
}
