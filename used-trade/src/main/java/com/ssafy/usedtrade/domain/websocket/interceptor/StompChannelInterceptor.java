package com.ssafy.usedtrade.domain.websocket.interceptor;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.common.jwt.JwtTokenProvider;
import com.ssafy.usedtrade.domain.redis.entity.ChattingReadPointRequest;
import com.ssafy.usedtrade.domain.redis.entity.ChattingTotalMessageRequest;
import com.ssafy.usedtrade.domain.redis.entity.MessageDetail;
import com.ssafy.usedtrade.domain.redis.entity.WebsocketSession;
import com.ssafy.usedtrade.domain.redis.service.ChattingReadPointService;
import com.ssafy.usedtrade.domain.redis.service.ChattingTotalMessageService;
import com.ssafy.usedtrade.domain.redis.service.MessageDetailService;
import com.ssafy.usedtrade.domain.redis.service.UserWebsocketSessionService;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatReadDto;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
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
    private final ChattingReadPointService chattingReadPointService;
    private final UserWebsocketSessionService userWebsocketSessionService;
    private final MessageDetailService messageDetailService;
    private final ChattingTotalMessageService chattingTotalMessageService;

    private final AESUtil aesUtil;
    private final ObjectMapper objectMapper;

    private final Map<String, Set<String>> sessions = new ConcurrentHashMap<>();

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

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();

            Set<String> destinations = sessions.computeIfAbsent(sessionId,
                    k -> ConcurrentHashMap.newKeySet());

            if (destinations.contains(destination)) {
                // 중복 구독 -> 예외 발생 또는 무시
                throw new IllegalArgumentException("이미 구독 중인 destination입니다: " + destination);
                // 또는 return null; // 무시할 수도 있음
            }

            destinations.add(destination);
        }

        switch (accessor.getCommand()) {
            case CONNECT -> {
                handleConnect(accessor);
            }
            case SEND -> {
                handleSend(accessor, message);
            }
            case DISCONNECT -> {
                handleDisconnect(accessor);
            }
        }

        return message;
    }

    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    private void handleDisconnect(StompHeaderAccessor accessor) {
        log.info("Disconnect({})", accessor.getSessionId());
    }

    private void handleSend(StompHeaderAccessor accessor, Message<?> message) {
        log.info("Send({})", accessor.getSessionId());

        // payload → JSON string으로 캐스팅 (보통 byte[] or String으로 들어옴)
        String payloadJson =
                new String((byte[]) message.getPayload(), StandardCharsets.UTF_8);

        // JSON → DTO 변환
        Map<String, Object> map =
                transToDto(payloadJson, HashMap.class);

        switch ((String) map.get("type")) {
            // TODO: 세션으로 받는 게 더 안전할 듯?
            case "MESSAGE" -> {
                ChatMessageDto chatMessageDto =
                        transToDto(payloadJson, ChatMessageDto.class);

//                chattingContentService.saveMessage(chatMessageDto);

                // read 시간 update
                chattingReadPointService.saveOrUpdate(
                        ChattingReadPointRequest.builder()
                                .channelId(aesUtil.decrypt(chatMessageDto.roomId()))
                                .userId(chatMessageDto.sender())
                                .createdAt(chatMessageDto.createdAt())
                                .build()
                        , false);

                // session 만료시간 초기화
                userWebsocketSessionService.saveSessionFor10(
                        WebsocketSession.builder()
                                .userId(chatMessageDto.sender())
                                .sessionId(accessor.getSessionId())
                                .build());

                LocalDateTime now = chatMessageDto.createdAt().plusHours(9);

                // +9
                // 메세지 내용
                messageDetailService.save(MessageDetail.builder()
                        .messageId(now + "_" + chatMessageDto.sender())
                        .message(ChatMessageDto.builder()
                                .type(chatMessageDto.type())
                                .roomId(chatMessageDto.roomId())
                                .sender(chatMessageDto.sender())
                                .message(chatMessageDto.message())
                                .createdAt(now)
                                .build())
                        .build());

                // +9
                // 채팅 방 전체 메세지 key 저장
                chattingTotalMessageService.save(
                        ChattingTotalMessageRequest.builder()
                                .chattingRoomId(chatMessageDto.roomId())
                                .messageId(now + "_" + chatMessageDto.sender())
                                .timestamp(now)
                                .build());
            }
            case "RECEIVE" -> {
                ChatReadDto chatReadDto =
                        transToDto(payloadJson, ChatReadDto.class);

                // read 시간 update
                chattingReadPointService.saveOrUpdate(
                        ChattingReadPointRequest.builder()
                                .channelId(aesUtil.decrypt(chatReadDto.roomId()))
                                .userId(chatReadDto.receiver())
                                .createdAt(chatReadDto.receiveAt())
                                .build(),
                        false);

                // session 만료시간 초기화
                userWebsocketSessionService.saveSessionFor10(
                        WebsocketSession.builder()
                                .userId(chatReadDto.receiver())
                                .sessionId(accessor.getSessionId())
                                .build()
                );

                log.info("receive");
            }
        }
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");

            if (token != null && token.startsWith("Bearer ")
                    && jwtTokenProvider.validate(token.substring(7))) {
                Authentication authentication =
                        jwtTokenProvider.decode(token.substring(7));
                accessor.setUser(authentication);
            }

            // 자신의 websocket 세션 만료시간 setting
            userWebsocketSessionService.saveSessionFor10(
                    WebsocketSession.builder()
                            .sessionId(accessor.getSessionId())
                            .userId(jwtTokenProvider.getUserIdFromToken(token.substring(7)))
                            .build());
        }

        log.info("[ws]({}) Connected", accessor.getSessionId());
    }

    // 특정 class로 trans
    private <T> T transToDto(String payloadJson, Class<T> clazz) {
        try {
            return objectMapper.readValue(payloadJson, clazz);
        } catch (Exception e) {
            throw new IllegalArgumentException("변환 과정 중 에러가 생겼습니다.");
        }
    }
}
