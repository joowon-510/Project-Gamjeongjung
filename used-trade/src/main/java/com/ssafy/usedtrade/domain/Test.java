package com.ssafy.usedtrade.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.domain.chat.service.ChattingContentService;
import com.ssafy.usedtrade.domain.redis.entity.ChattingReadPointRequest;
import com.ssafy.usedtrade.domain.redis.entity.ChattingTotalMessageRequest;
import com.ssafy.usedtrade.domain.redis.entity.MessageDetail;
import com.ssafy.usedtrade.domain.redis.service.ChattingReadPointService;
import com.ssafy.usedtrade.domain.redis.service.ChattingTotalMessageService;
import com.ssafy.usedtrade.domain.redis.service.MessageDetailService;
import com.ssafy.usedtrade.domain.redis.service.UserWebsocketSessionService;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class Test {
    private final ObjectMapper objectMapper;
    private final ChattingContentService chattingContentService;
    private final ChattingReadPointService chattingReadPointService;
    private final AESUtil aesUtil;
    private final UserWebsocketSessionService userWebsocketSessionService;
    private final MessageDetailService messageDetailService;
    private final ChattingTotalMessageService chattingTotalMessageService;

    @GetMapping("/test")
    public void test() {
        for (int i = 0; i < 100_00; i++) {
            ChatMessageDto chatMessageDto = ChatMessageDto.builder()
                    .type("MESSAGE")
                    .sender("1")
                    .roomId("XC4xPu3yQuuu-s-uflMIOg")
                    .message("12312")
                    .createdAt(LocalDateTime.now().plusSeconds(i))
                    .build();

            chattingContentService.saveMessage(chatMessageDto);

            // read 시간 update
            chattingReadPointService.saveOrUpdate(
                    ChattingReadPointRequest.builder()
                            .channelId(aesUtil.decrypt(chatMessageDto.roomId()))
                            .userId(chatMessageDto.sender())
                            .createdAt(chatMessageDto.createdAt())
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
    }

    private <T> T transToDto(String payloadJson, Class<T> clazz) {
        try {
            return objectMapper.readValue(payloadJson, clazz);
        } catch (Exception e) {
            throw new IllegalArgumentException("변환 과정 중 에러가 생겼습니다.");
        }
    }
}
