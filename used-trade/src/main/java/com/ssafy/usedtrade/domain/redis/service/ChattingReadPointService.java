package com.ssafy.usedtrade.domain.redis.service;

import com.ssafy.usedtrade.domain.redis.entity.ChattingReadPointRequest;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChattingReadPointService {
    private final RedisTemplate<String, String> redisTemplate;

    public LocalDateTime find(ChattingReadPointRequest chattingReadPointRequest) {
        String data = (String) redisTemplate.opsForHash().get(
                getKey(chattingReadPointRequest),
                chattingReadPointRequest.userId()
        );

        if (data == null) {
            return LocalDateTime
                    .of(1999, 2, 11, 0, 0, 0);
        }

        return LocalDateTime.parse(data);
    }

    // 특정 channelId의 모든 사용자 read point 조회
    public Map<Object, Object> findAll(String channelId) {
        return redisTemplate.opsForHash().entries("readPoint:" + channelId);
    }

    // +9
    public void saveOrUpdate(ChattingReadPointRequest chattingReadPointRequest, boolean isRdbData) {
        LocalDateTime now =
                isRdbData
                        ? chattingReadPointRequest.createdAt()
                        : chattingReadPointRequest.createdAt().plusHours(9);

        redisTemplate.opsForHash().put(
                getKey(chattingReadPointRequest),
                chattingReadPointRequest.userId(),
                now.toString()
        );
    }

    public void delete(ChattingReadPointRequest chattingReadPointRequest) {
        redisTemplate.opsForHash().delete(
                getKey(chattingReadPointRequest),
                chattingReadPointRequest.userId()
        );
    }

    private static String getKey(ChattingReadPointRequest chattingReadPointRequest) {
        return "readPoint:" + chattingReadPointRequest.channelId();
    }
}
