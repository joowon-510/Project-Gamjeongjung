package com.ssafy.usedtrade.domain.redis.stream;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChattingStreamRunner implements ApplicationRunner {

    private final ChattingStreamConsumer consumer;

    @Override
    public void run(ApplicationArguments args) {
        consumer.init();
        consumer.consumeChatMessages();
    }
}