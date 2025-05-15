package com.ssafy.usedtrade.domain.websocket.controller;

import com.ssafy.usedtrade.domain.redis.service.UserWebsocketSessionService;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebsocketController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final UserWebsocketSessionService websocketSessionService;

    @MessageMapping("/{roomId}")
    public void send(
            @Payload Map<String, String> message,
            @DestinationVariable("roomId") String roomId,
            @Header("simpSessionId") String sessionId
    ) {
        message.put("createdAt",
                String.valueOf(LocalDateTime.ofInstant(
                        Instant.parse(message.get("createdAt")),
                        ZoneId.of("Asia/Seoul")
                )));

        simpMessagingTemplate.convertAndSend(
                "/receive/" + roomId, message);
    }
}
