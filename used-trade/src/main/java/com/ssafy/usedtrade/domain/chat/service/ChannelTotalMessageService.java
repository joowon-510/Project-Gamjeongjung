package com.ssafy.usedtrade.domain.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.domain.chat.dto.ChannelTotalMessageRequest;
import com.ssafy.usedtrade.domain.chat.dto.ChannelTotalMessageResponse;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChannelTotalMessageService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public ChannelTotalMessageResponse find(ChannelTotalMessageRequest channelTotalMessageRequest) {
        // ChannelTotalMessageResponse로 return 하는데, 특정 구간동안을 제공
        // 채팅의 페이지 네이션
        return null;
    }

    public void save(ChannelTotalMessageRequest channelTotalMessageRequest) {
        redisTemplate.opsForZSet().add(
                getKey(channelTotalMessageRequest),
                channelTotalMessageRequest.getMessageId() + " " + channelTotalMessageRequest.getTimestamp(),
                getEpochMilli(channelTotalMessageRequest));
    }

    public void update(ChannelTotalMessageRequest channelTotalMessageRequest) {
        redisTemplate.opsForValue().set(
                getKey(channelTotalMessageRequest),
                channelTotalMessageRequest.getMessageId() + " " + channelTotalMessageRequest.getTimestamp(),
                getEpochMilli(channelTotalMessageRequest));
    }

    public void delete(ChannelTotalMessageRequest channelTotalMessageRequest) {
        redisTemplate.delete(getKey(channelTotalMessageRequest));
    }

    private static String getKey(ChannelTotalMessageRequest channelTotalMessageRequest) {
        return "channel:" + channelTotalMessageRequest.getChannel();
    }
    
    private static long getEpochMilli(ChannelTotalMessageRequest channelTotalMessageRequest) {
        return channelTotalMessageRequest.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }
}
