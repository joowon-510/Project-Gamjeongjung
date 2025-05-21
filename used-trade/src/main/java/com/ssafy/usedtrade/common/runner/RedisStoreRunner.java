package com.ssafy.usedtrade.common.runner;

import com.ssafy.usedtrade.domain.chat.entity.ReadPoint;
import com.ssafy.usedtrade.domain.chat.repository.ReadPointRepository;
import com.ssafy.usedtrade.domain.redis.entity.ChattingReadPointRequest;
import com.ssafy.usedtrade.domain.redis.service.ChattingReadPointService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisStoreRunner implements ApplicationRunner {
    private final ReadPointRepository readPointRepository;
    private final ChattingReadPointService chattingReadPointService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 읽기 시간 모든 insert
        List<ReadPoint> readPointList = readPointRepository.findAll();

        for (ReadPoint readPoint : readPointList) {
            chattingReadPointService.saveOrUpdate(
                    ChattingReadPointRequest.builder()
                            .channelId(readPoint.getRoomId())
                            .userId(readPoint.getUserId())
                            .createdAt(readPoint.getCreatedAt())
                            .build(),
                    true
            );
        }
    }
}
