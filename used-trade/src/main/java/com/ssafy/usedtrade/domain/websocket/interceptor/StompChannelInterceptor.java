package com.ssafy.usedtrade.domain.websocket.interceptor;

import com.ssafy.usedtrade.common.jwt.JwtTokenProvider;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompChannelInterceptor implements ChannelInterceptor {
    private final JwtTokenProvider jwtTokenProvider;

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
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");

            if (token != null && token.startsWith("Bearer ") && jwtTokenProvider.validate(token.substring(7))) {
                Authentication authentication = jwtTokenProvider.decode(token.substring(7));
                accessor.setUser(authentication);
            }

            log.info("[ws]({}) Connected", accessor.getSessionId());
        }
    }
}
