package com.ssafy.usedtrade.domain.websocket.redis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.domain.websocket.dto.request.ChatMessageDto;
import com.ssafy.usedtrade.domain.websocket.redis.entity.MessageDetail;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MessageDetailService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ChatMessageDto find(String messageId) {
        String data =
                redisTemplate.opsForValue().get(messageId);

        if (data == null) {
            return null;
        }

        return toResponse(data);
    }

    private ChatMessageDto toResponse(String data) {
        try {
            return objectMapper.convertValue(data, ChatMessageDto.class);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        return null;
    }

    public void save(MessageDetail messageDetail) {
        redisTemplate.opsForValue().set(
                String.valueOf(messageDetail.getMessageId()),
                String.valueOf(messageDetail.getMessage()));
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
