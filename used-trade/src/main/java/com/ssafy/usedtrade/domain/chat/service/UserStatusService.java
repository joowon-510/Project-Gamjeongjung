package com.ssafy.usedtrade.domain.chat.service;

import com.ssafy.usedtrade.domain.chat.entity.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserStatusService {
    private final com.ssafy.usedtrade.domain.chat.repository.UserStatusRepository userStatusRepository;

    public boolean findUserStatus(Integer userId) {
        return userStatusRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저의 상태가 존재하지 않습니다."))
                .isOnline();
    }

    @Transactional
    public void joinUserStatus(Integer userId) {
        userStatusRepository.save(
                UserStatus.builder()
                        .userId(userId)
                        .online(true)
                        .build()
        );
    }

    @Transactional
    public void outUserStatus(Integer userId) {
        userStatusRepository.save(
                UserStatus.builder()
                        .userId(userId)
                        .online(false)
                        .build()
        );
    }
}
