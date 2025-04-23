package com.ssafy.usedtrade.domain.user.service;

import com.ssafy.usedtrade.domain.user.dto.request.updateUserInfoNicknameRequest;
import com.ssafy.usedtrade.domain.user.dto.response.UserInfoResponse;
import com.ssafy.usedtrade.domain.user.entity.User;
import com.ssafy.usedtrade.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserInfoResponse findUserInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(IllegalArgumentException::new);

        return UserInfoResponse.builder()
                .email(user.getEmail())
                .nickname(user.getNickname())
                .status(user.getStatus())
                .build();
    }

    @Transactional(readOnly = false)
    public void updateUserInfoNickname(String email, updateUserInfoNicknameRequest updateUserInfoNicknameRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(IllegalArgumentException::new);

        user.updateNickname(updateUserInfoNicknameRequest.nickname());
    }
}
