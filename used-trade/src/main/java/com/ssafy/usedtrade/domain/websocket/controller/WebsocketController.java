package com.ssafy.usedtrade.domain.websocket.controller;

import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.domain.redis.stream.RedisStreamService;
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
    private final RedisStreamService redisStreamService;
    private final AESUtil aesUtil;

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

        switch (message.get("type")) {
            case "MESSAGE" -> {
                String roomIdInMessage = message.get("roomId");
                String sender = message.get("sender");
                String messageContent = message.get("message");
                LocalDateTime createdAt = LocalDateTime.parse(message.get("createdAt")).plusHours(9);

                redisStreamService.saveChatMessageToStream(roomIdInMessage, sender, messageContent, createdAt);
                redisStreamService.saveChatReadPointToStream(roomIdInMessage, sender, createdAt);
            }
            case "RECEIVE" -> {
                String roomIdInMessage = message.get("roomId");
                String receiver = message.get("receiver");
                LocalDateTime receiveAt = LocalDateTime.parse(message.get("receiveAt")).plusHours(9);

                redisStreamService.saveChatReadPointToStream(roomIdInMessage, receiver, receiveAt);
            }
        }
    }
}
