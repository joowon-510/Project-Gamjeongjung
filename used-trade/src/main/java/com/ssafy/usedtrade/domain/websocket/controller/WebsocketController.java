package com.ssafy.usedtrade.domain.websocket.controller;

import java.util.Map;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebsocketController {

    @MessageMapping("/{roomId}") // 클라이언트가 보내는 주소 (/api/chat/번호)
    @SendTo("/room/{roomId}") // 구독 주소 (자동 전달)
    public Map<String, String> send(
            @Payload Map<String, String> message,
            @DestinationVariable("roomId") Long roomId
    ) {
        return message; // 브로커가 이 메시지를 그대로 전달
    }
}
