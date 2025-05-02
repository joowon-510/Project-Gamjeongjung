package com.ssafy.usedtrade.domain.websocket.redis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.domain.websocket.redis.dto.ChannelTotalMessageResponse;
import com.ssafy.usedtrade.domain.websocket.redis.entity.ChattingTotalMessageRequest;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChattingTotalMessageService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ChannelTotalMessageResponse find(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        // ChannelTotalMessageResponse로 return 하는데, 특정 구간동안을 제공
        // 채팅의 페이지 네이션
        return null;
    }

    public void save(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        redisTemplate.opsForZSet().add(
                getKey(chattingTotalMessageRequest),
                chattingTotalMessageRequest.getMessageId(),
                getEpochMilli(chattingTotalMessageRequest));
    }

    public void update(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        redisTemplate.opsForValue().set(
                getKey(chattingTotalMessageRequest),
                chattingTotalMessageRequest.getMessageId(),
                getEpochMilli(chattingTotalMessageRequest));
    }

    public void delete(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        redisTemplate.delete(getKey(chattingTotalMessageRequest));
    }

    private static String getKey(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        return "channel:" + chattingTotalMessageRequest.getChattingRoomId();
    }

    private static long getEpochMilli(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        return chattingTotalMessageRequest.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }
}
