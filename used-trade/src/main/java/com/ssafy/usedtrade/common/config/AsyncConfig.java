package com.ssafy.usedtrade.common.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class AsyncConfig {
    @Bean(name = "readStreamExecutor")
    public Executor readStreamExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);     // 최소 스레드 수
        executor.setMaxPoolSize(2);      // 최대 스레드 수
        executor.setQueueCapacity(100);  // 대기 큐 용량
        executor.setThreadNamePrefix("read-stream-");
        executor.initialize();
        return executor;
    }

    @Bean(name = "chattingStreamExecutor")
    public Executor chattingStreamExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);     // 최소 스레드 수
        executor.setMaxPoolSize(2);      // 최대 스레드 수
        executor.setQueueCapacity(100);  // 대기 큐 용량
        executor.setThreadNamePrefix("chatting-stream-");
        executor.initialize();
        return executor;
    }
}
