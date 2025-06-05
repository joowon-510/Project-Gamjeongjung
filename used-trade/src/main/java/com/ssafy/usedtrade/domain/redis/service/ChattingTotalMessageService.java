package com.ssafy.usedtrade.domain.redis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.usedtrade.domain.redis.entity.ChattingTotalMessageRequest;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChattingTotalMessageService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public Set<String> findAllKeys() {
        return redisTemplate.keys("channel:*");
    }

    public void save(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        String key = getKey(chattingTotalMessageRequest);

        redisTemplate.opsForZSet().add(
                key,
                chattingTotalMessageRequest.getMessageId(),
                getEpochMilli(chattingTotalMessageRequest));

        redisTemplate.expire(key, Duration.ofDays(7));
    }

    public void delete(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        redisTemplate.delete(getKey(chattingTotalMessageRequest));
    }

    public long count(String roomId, LocalDateTime lastReadTimestamp) {
        Long count = redisTemplate.opsForZSet().count(
                getKey(roomId),
                getEpochMilli(lastReadTimestamp) + 1,
                Double.MAX_VALUE);

        return count == null ? 0L : count;
    }

    public String getLatestMessageId(String roomId) {
        Set<String> result = redisTemplate.opsForZSet()
                .reverseRange(getKey(roomId), 0, 0); // 최신 1개만 가져오기

        return result != null && !result.isEmpty()
                ? result.iterator().next()
                : null; // 또는 기본값 처리
    }

    public List<String> multiGetMessage(String roomId, Double maxScore) {
        return redisTemplate.opsForValue().multiGet(
                redisTemplate.opsForZSet()
                        .reverseRangeByScore(getKey(roomId), 0, maxScore, 0, 100));
    }

    public boolean hasMoreMessage(String roomId, Double maxScore) {
        Set<String> result = redisTemplate.opsForZSet()
                .reverseRangeByScore(roomId + "-message", 0, maxScore - 1, 0, 1);
        return result != null && !result.isEmpty();
    }

    private static String getKey(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        return "channel:" + chattingTotalMessageRequest.getChattingRoomId();
    }

    private static String getKey(String roomId) {
        return "channel:" + roomId;
    }

    // +9
    private static long getEpochMilli(ChattingTotalMessageRequest chattingTotalMessageRequest) {
        return chattingTotalMessageRequest.getTimestamp()
                .plusHours(9).atZone(ZoneId.systemDefault())
                .toInstant().toEpochMilli();
    }

    // +9
    private static long getEpochMilli(LocalDateTime localDateTime) {
        return localDateTime.plusHours(9)
                .atZone(ZoneId.systemDefault())
                .toInstant().toEpochMilli();
    }
}
