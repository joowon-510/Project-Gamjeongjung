package com.ssafy.usedtrade.domain.redis.stream;

import com.ssafy.usedtrade.common.encryption.AESUtil;
import com.ssafy.usedtrade.domain.chat.entity.ChattingContent;
import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import com.ssafy.usedtrade.domain.chat.repository.ChattingContentRepository;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
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
public class ChattingStreamConsumer {
    private final StreamOperations<String, String, String> streamOps;
    private final ChattingContentRepository chattingContentRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final AESUtil aesUtil;
    private volatile boolean running;

    final String streamKey = "chat-message-stream";
    final String group = "chat-consumer-group";
    final String consumer = "chat-consumer";

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
                        "contents", "init",
                        "createdAt", LocalDateTime.now().toString()
                );

                streamOps.add(StreamRecords.mapBacked(dummy).withStreamKey(streamKey));
                log.info("Initialized stream: {}", streamKey);
            }

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

            log.info("Group created: {}", group);
        } catch (Exception e) {
            log.warn("Group may already exist: {}", e.getMessage());
        }
    }


    @Async("chatStreamExecutor") // 별도 쓰레드
    public void consumeChatMessages() {
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

                log.info("inner" + LocalDateTime.now());

                for (MapRecord<String, String, String> record : records) {
                    Map<String, String> msg = record.getValue();

                    chattingContentRepository.save(
                            ChattingContent.builder()
                                    .chattingList(
                                            ChattingList.builder()
                                                    .id(Integer.valueOf(aesUtil.decrypt(msg.get("roomId"))))
                                                    .build()
                                    )
                                    .userId(Integer.valueOf(msg.get("userId")))
                                    .contents(msg.get("contents"))
                                    .createdAt(LocalDateTime.parse(msg.get("createdAt")))
                                    .build()
                    );

                    // ack 처리
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
