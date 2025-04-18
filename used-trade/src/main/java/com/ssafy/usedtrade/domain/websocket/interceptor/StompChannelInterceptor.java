package com.ssafy.usedtrade.domain.websocket.interceptor;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() == null) {
            throw new IllegalStateException("StompHeaderAccessor or command should never be null");
        }

        String sessionId = accessor.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalStateException("Missing session ID in STOMP message");
        }

        switch (accessor.getCommand()) {
            case CONNECT -> handleConnect(accessor);
            case SEND -> handleSend(accessor);
            case DISCONNECT -> handleDisconnect(accessor);
        }

        return message;
    }

    private void handleDisconnect(StompHeaderAccessor accessor) {
        log.info("Disconnect({})", accessor.getSessionId());
    }

    private void handleSend(StompHeaderAccessor accessor) {
        log.info("Send({})", accessor.getSessionId());
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        log.info("[ws]({}) Connected", accessor.getSessionId());
    }
}
