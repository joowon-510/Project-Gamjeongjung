package com.ssafy.usedtrade.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
public class AsyncConfig {
    @Bean(name = "readStreamExecutor", destroyMethod = "shutdown")
    public ThreadPoolTaskExecutor readStreamExecutor() {
        return executorMethod("read-stream-");
    }

    @Bean(name = "chatStreamExecutor", destroyMethod = "shutdown")
    public ThreadPoolTaskExecutor chatStreamExecutor() {
        return executorMethod("chat-stream-");
    }

    private ThreadPoolTaskExecutor executorMethod(String threadNamePrefix) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);     // 최소 스레드 수
        executor.setMaxPoolSize(1);      // 최대 스레드 수
        executor.setQueueCapacity(100);  // 대기 큐 용량
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.initialize();
        return executor;
    }
}
