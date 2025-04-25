package com.ssafy.usedtrade.domain.chat.service;

import com.ssafy.usedtrade.domain.chat.dto.WebsocketSessionDto;
import java.time.Duration;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserWebsocketSessionService {
    private final int TTL = 10;

    private final RedisTemplate<String, String> redisTemplate;

    public long findSessionTTL(WebsocketSessionDto websocketSessionDto) {
        return redisTemplate.getExpire(
                getKey(websocketSessionDto),
                TimeUnit.SECONDS); // 남은 시간 (초)
    }

    public void saveSessionFor10(WebsocketSessionDto websocketSessionDto) {
        redisTemplate.opsForValue().set(
                getKey(websocketSessionDto),
                "1",
                Duration.ofMinutes(TTL));
    }

    public void update(WebsocketSessionDto websocketSessionDto) {
        redisTemplate.expire(
                getKey(websocketSessionDto),
                Duration.ofMinutes(TTL));
    }

    public void delete(WebsocketSessionDto websocketSessionDto) {
        redisTemplate.delete(
                getKey(websocketSessionDto));
    }

    private static String getKey(WebsocketSessionDto websocketSessionDto) {
        return "session:" + websocketSessionDto.userId() + ":" + websocketSessionDto.sessionId();
    }
}
