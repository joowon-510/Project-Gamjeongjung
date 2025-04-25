package com.ssafy.usedtrade.domain.websocket.interceptor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.common.jwt.JwtTokenProvider;
import com.ssafy.usedtrade.domain.chat.service.ChattingContentService;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatReadDto;
import java.nio.charset.StandardCharsets;
import java.util.Map;
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
    private final ObjectMapper objectMapper;
    private final ChattingContentService chattingContentService;

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
            case SEND -> handleSend(accessor, message);
            case DISCONNECT -> handleDisconnect(accessor);
        }

        return message;
    }

    private void handleDisconnect(StompHeaderAccessor accessor) {
        log.info("Disconnect({})", accessor.getSessionId());
    }

    private void handleSend(StompHeaderAccessor accessor, Message<?> message) {
        log.info("Send({})", accessor.getSessionId());

        try {
            // payload → JSON string으로 캐스팅 (보통 byte[] or String으로 들어옴)
            String payloadJson = new String((byte[]) message.getPayload(), StandardCharsets.UTF_8);
            System.out.println("📦 Payload: " + payloadJson);

            // JSON → DTO 변환
            Map<String, Object> map =
                    objectMapper.readValue(payloadJson, new TypeReference<>() {
                    });

            switch ((String) map.get("type")) {
                case "MESSAGE" -> {
                    chattingContentService.saveMessage(
                            objectMapper.readValue(payloadJson, ChatMessageDto.class));
                }
                case "RECEIVE" -> {
                    // TODO: 읽음여부 판단 구현
                    log.info("receive");

                    ChatReadDto chatReadDto =
                            objectMapper.readValue(payloadJson, ChatReadDto.class);
                }
            }
        } catch (Exception e) {
            log.error("❌ 메시지 파싱 실패", e);
        }
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
