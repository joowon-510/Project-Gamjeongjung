package com.ssafy.usedtrade.domain.websocket.interceptor;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.common.jwt.JwtTokenProvider;
import com.ssafy.usedtrade.domain.chat.service.ChattingContentService;
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
import java.util.HashMap;
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
    private final ChattingContentService chattingContentService;
    private final ChattingReadPointService chattingReadPointService;
    private final UserWebsocketSessionService userWebsocketSessionService;
    private final MessageDetailService messageDetailService;
    private final ChattingTotalMessageService chattingTotalMessageService;

    private final AESUtil aesUtil;
    private final ObjectMapper objectMapper;

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

                chattingContentService.saveMessage(chatMessageDto);

                // read 시간 update
                chattingReadPointService.saveOrUpdate(
                        ChattingReadPointRequest.builder()
                                .channelId(aesUtil.decrypt(chatMessageDto.roomId()))
                                .userId(chatMessageDto.sender())
                                .createdAt(chatMessageDto.createdAt())
                                .build());

                // session 만료시간 초기화
                userWebsocketSessionService.saveSessionFor10(
                        WebsocketSession.builder()
                                .userId(chatMessageDto.sender())
                                .sessionId(accessor.getSessionId())
                                .build());

                // 메세지 내용
                messageDetailService.save(MessageDetail.builder()
                        .messageId(chatMessageDto.createdAt()
                                + "_" + chatMessageDto.sender())
                        .message(chatMessageDto)
                        .build());

                // 채팅 방 전체 메세지 key 저장
                chattingTotalMessageService.save(
                        ChattingTotalMessageRequest.builder()
                                .chattingRoomId(chatMessageDto.roomId())
                                .messageId(chatMessageDto.createdAt()
                                        + "_" + chatMessageDto.sender())
                                .timestamp(chatMessageDto.createdAt())
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
                                .build());

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
