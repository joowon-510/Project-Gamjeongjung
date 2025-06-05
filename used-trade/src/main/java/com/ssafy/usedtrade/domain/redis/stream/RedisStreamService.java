package com.ssafy.usedtrade.domain.redis.stream;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStreamService {
    private final StreamOperations<String, String, String> streamOperations;

    public void saveChatMessageToStream(String roomId, String userId, String contents, LocalDateTime createdAt) {
        Map<String, String> message = new HashMap<>();
        message.put("roomId", roomId);
        message.put("userId", userId);
        message.put("contents", contents);
        message.put("createdAt", createdAt.toString());

        RecordId recordId = streamOperations.add(
                StreamRecords.mapBacked(message)
                        .withStreamKey("chat-message-stream")
        );

        log.info("Saved chat to Redis Stream with id: {}", recordId.getValue());
    }

    public void saveChatReadPointToStream(String roomId, String userId, LocalDateTime createdAt) {
        Map<String, String> message = new HashMap<>();
        message.put("roomId", roomId);
        message.put("userId", userId);
        message.put("createdAt", createdAt.toString());

        RecordId recordId = streamOperations.add(
                StreamRecords.mapBacked(message)
                        .withStreamKey("chat-read-stream")
        );

        log.info("Saved chat to Redis Stream with id: {}", recordId.getValue());
    }
}
