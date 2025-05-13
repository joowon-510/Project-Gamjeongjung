package com.ssafy.usedtrade.domain.redis.service;

import com.ssafy.usedtrade.domain.redis.entity.WebsocketSession;
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

    public long findSessionTTL(WebsocketSession websocketSession) {
        return redisTemplate.getExpire(
                getKey(websocketSession),
                TimeUnit.SECONDS); // 남은 시간 (초)
    }

    public void saveSessionFor10(WebsocketSession websocketSession) {
        redisTemplate.opsForValue().set(
                getKey(websocketSession),
                websocketSession.userId(),
                Duration.ofMinutes(TTL));
    }

    public void update(WebsocketSession websocketSession) {
        redisTemplate.expire(
                getKey(websocketSession),
                Duration.ofMinutes(TTL));
    }

    public void delete(WebsocketSession websocketSession) {
        redisTemplate.delete(
                getKey(websocketSession));
    }

    private static String getKey(WebsocketSession websocketSession) {
        return "session:" + websocketSession.sessionId();
    }
}
