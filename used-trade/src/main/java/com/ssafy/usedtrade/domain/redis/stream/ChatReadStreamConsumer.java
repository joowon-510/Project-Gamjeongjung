package com.ssafy.usedtrade.domain.redis.stream;

import com.ssafy.usedtrade.domain.chat.entity.ReadPoint;
import com.ssafy.usedtrade.domain.chat.repository.ReadPointRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.connection.stream.StreamReadOptions;
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

    final String streamKey = "chatting-read-stream";
    final String group = "chatting-read-group";
    final String consumer = "chatting-read-consumer";

    public void init() {
        try {
            // Stream 없으면 dummy 삽입
            if (!Boolean.TRUE.equals(redisTemplate.hasKey(streamKey))) {
                streamOps.createGroup(streamKey, ReadOffset.latest(), group);
                log.info("Initialized stream: {}", streamKey);
            }

            log.info("Group created: {}", group);
        } catch (Exception e) {
            log.warn("Group may already exist: {}", e.getMessage());
        }
    }

    @Async("readStreamExecutor")
    public void consumeReadPoints() {
        while (true) {
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

                    readPointRepository.save(
                            ReadPoint.builder()
                                    .roomId(msg.get("roomId"))
                                    .userId(msg.get("userId"))
                                    .createdAt(LocalDateTime.parse(msg.get("createdAt")))
                                    .build()
                    );

                    streamOps.acknowledge(streamKey, group, record.getId());
                    log.info("ACK chat-read-stream msgId={} roomId={} userId={}",
                            record.getId(), msg.get("roomId"), msg.get("userId"));
                }
            } catch (Exception e) {
                log.error("Error consuming Redis Stream: {}", e.getMessage(), e);
            }
        }
    }
}