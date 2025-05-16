package com.ssafy.usedtrade.common.runner;

import com.ssafy.usedtrade.domain.chat.repository.ChattingContentRepository;
import com.ssafy.usedtrade.domain.chat.repository.ChattingListRepository;
import com.ssafy.usedtrade.domain.chat.repository.ReadPointRepository;
import com.ssafy.usedtrade.domain.redis.service.ChattingReadPointService;
import com.ssafy.usedtrade.domain.redis.service.ChattingTotalMessageService;
import com.ssafy.usedtrade.domain.redis.service.MessageDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisStoreRunner implements ApplicationRunner {
    /*
     * TODO
     *  1. chatting 모두 redis에 저장 | {datetime}_{userId}
     *  2. chatting room도 모두 redis에 저장 | channel:{암호화된-roomid}
     *  3. 읽음 시간도 모두 redis에 저장 | readPoint:{roomId}
     * */
    private final ChattingContentRepository chattingContentRepository;
    private final ChattingListRepository chattingListRepository;
    private final ReadPointRepository readPointRepository;

    private final ChattingTotalMessageService chattingTotalMessageService;
    private final ChattingReadPointService chattingReadPointService;
    private final MessageDetailService messageDetailService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 1. 읽기 시간 모든 insert

        // 2. 모든 메세지 list insert

        // 3. 모든 메세지 insert
    }
}
