package com.ssafy.usedtrade.domain.redis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.domain.redis.entity.MessageDetail;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MessageDetailService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ChatMessageDto find(String messageId) {
        if (messageId == null) {
            return toResponse(null, false);
        }

        String data = redisTemplate.opsForValue().get(messageId);

        return toResponse(data, data != null);
    }

    private ChatMessageDto toResponse(String data, boolean isNull) {
        try {
            if (isNull) {
                return objectMapper.readValue(data, ChatMessageDto.class);
            }

            return ChatMessageDto.builder()
                    .message("메세지가 존재하지 않습니다!")
                    .build();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        return null;
    }

    public void save(MessageDetail messageDetail) {
        try {
            String json = objectMapper.writeValueAsString(messageDetail.getMessage());
            redisTemplate.opsForValue().set(
                    String.valueOf(messageDetail.getMessageId()),
                    json,
                    Duration.ofDays(7)
            );
        } catch (Exception e) {
            System.out.println("❌ 직렬화 실패: " + e.getMessage());
        }
    }

    public void update(MessageDetail messageDetail) {
        redisTemplate.opsForValue().set(
                String.valueOf(messageDetail.getMessageId()),
                String.valueOf(messageDetail.getMessage()));
    }

    public void delete(MessageDetail messageDetail) {
        redisTemplate.delete(String.valueOf(messageDetail.getMessageId()));
    }
}
