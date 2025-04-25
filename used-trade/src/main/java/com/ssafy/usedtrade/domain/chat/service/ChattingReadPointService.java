package com.ssafy.usedtrade.domain.chat.service;

import com.ssafy.usedtrade.domain.chat.dto.ChattingReadPointRequest;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChattingReadPointService {
    private final RedisTemplate<String, String> redisTemplate;

    public LocalDateTime find(ChattingReadPointRequest chattingReadPointRequest) {
        String data = redisTemplate.opsForValue()
                .get(getKey(chattingReadPointRequest));

        if (data == null) {
            return null;
        }

        return LocalDateTime.parse(data);
    }

    public void save(ChattingReadPointRequest chattingReadPointRequest) {
        redisTemplate.opsForValue().set(
                getKey(chattingReadPointRequest),
                String.valueOf(LocalDateTime.now()));
    }

    public void update(ChattingReadPointRequest chattingReadPointRequest) {
        redisTemplate.opsForValue().set(
                getKey(chattingReadPointRequest),
                String.valueOf(LocalDateTime.now()));
    }

    public void delete(ChattingReadPointRequest chattingReadPointRequest) {
        redisTemplate.delete(
                getKey(chattingReadPointRequest));
    }

    private static String getKey(ChattingReadPointRequest chattingReadPointRequest) {
        return "readPoint:" + chattingReadPointRequest.channelId() + ":" + chattingReadPointRequest.userId();
    }
}
