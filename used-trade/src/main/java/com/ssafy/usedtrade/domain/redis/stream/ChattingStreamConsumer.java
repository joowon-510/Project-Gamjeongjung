package com.ssafy.usedtrade.domain.redis.stream;

import com.ssafy.usedtrade.domain.chat.entity.ChattingContent;
import com.ssafy.usedtrade.domain.chat.entity.ChattingList;
import com.ssafy.usedtrade.domain.chat.repository.ChattingContentRepository;
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
public class ChattingStreamConsumer {
    private final StreamOperations<String, String, String> streamOps;
    private final ChattingContentRepository chattingContentRepository;
    private final RedisTemplate<String, String> redisTemplate;

    final String streamKey = "chatting-message-stream";
    final String group = "chatting-consumer-group";
    final String consumer = "chatting-consumer";

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


    @Async("chattingStreamExecutor") // 별도 쓰레드
    public void consumeChatMessages() {
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

                    chattingContentRepository.save(
                            ChattingContent.builder()
                                    .chattingList(
                                            ChattingList.builder()
                                                    .id(Integer.valueOf(msg.get("roomId")))
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
