package com.ssafy.usedtrade.domain.redis.stream;

import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.domain.chat.entity.ReadPoint;
import com.ssafy.usedtrade.domain.chat.repository.ReadPointRepository;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.connection.stream.StreamReadOptions;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatReadStreamConsumer {
    private final StreamOperations<String, String, String> streamOps;
    private final RedisTemplate<String, String> redisTemplate;
    private final ReadPointRepository readPointRepository;
    private final AESUtil aesUtil;
    private volatile boolean running;

    final String streamKey = "chat-read-stream";
    final String group = "chat-read-group";
    final String consumer = "chat-read-consumer";

    @PreDestroy
    public void shutdown() {
        running = true;
    }

    public void init() {
        try {
            // Stream 없으면 dummy 삽입
            if (!Boolean.TRUE.equals(redisTemplate.hasKey(streamKey))) {
                Map<String, String> dummy = Map.of(
                        "roomId", "0",
                        "userId", "0",
                        "createdAt", LocalDateTime.now().toString()
                );

                streamOps.add(StreamRecords.mapBacked(dummy).withStreamKey(streamKey));

                List<Object> groups = redisTemplate.execute((RedisCallback<List<Object>>) connection ->
                        Collections.singletonList(connection.streamCommands().xInfoGroups(streamKey.getBytes()))
                );

                boolean groupExists = groups != null && groups.stream().anyMatch(info ->
                        info.toString().contains(group) // 간단 비교
                );

                if (!groupExists) {
                    streamOps.createGroup(streamKey, ReadOffset.latest(), group);
                    log.info("Consumer group created: {}", group);
                }

                log.info("Initialized stream: {}", streamKey);
            }

            log.info("Group created: {}", group);
        } catch (Exception e) {
            log.warn("Group may already exist: {}", e.getMessage());
        }
    }

    @Async("readStreamExecutor")
    public void consumeReadPoints() {
        while (!running) {
            try {
                List<MapRecord<String, String, String>> records =
                        streamOps.read(
                                Consumer.from(group, consumer),
                                StreamReadOptions.empty().count(10).block(Duration.ofSeconds(2)),
                                StreamOffset.create(streamKey, ReadOffset.lastConsumed())
                        );

                if (records == null || records.isEmpty()) {
                    continue;
                }

                for (MapRecord<String, String, String> record : records) {
                    Map<String, String> msg = record.getValue();
                    String decryptRoomId = aesUtil.decrypt(msg.get("roomId"));
                    String userId = msg.get("userId");

                    Optional<ReadPoint> readPointOptional =
                            readPointRepository.findByUserIdAndRoomId(userId, decryptRoomId);

                    //readPoint 존재 여부 확인 후, 수정 후 삽입 or 그냥 삽입
                    if (readPointOptional.isPresent()) {
                        readPointRepository.save(
                                ReadPoint.builder()
                                        .id(readPointOptional.get().getId())
                                        .roomId(decryptRoomId)
                                        .userId(userId)
                                        .createdAt(LocalDateTime.parse(msg.get("createdAt")))
                                        .build()
                        );
                    } else {
                        readPointRepository.save(
                                ReadPoint.builder()
                                        .roomId(decryptRoomId)
                                        .userId(userId)
                                        .createdAt(LocalDateTime.parse(msg.get("createdAt")))
                                        .build()
                        );
                    }

                    streamOps.acknowledge(streamKey, group, record.getId());
                    log.info("ACK chat-read-stream msgId={} roomId={} userId={}",
                            record.getId(), decryptRoomId, userId);
                }
            } catch (Exception e) {
                log.error("Error consuming Redis Stream: {}", e.getMessage(), e);
            }
        }
    }
}