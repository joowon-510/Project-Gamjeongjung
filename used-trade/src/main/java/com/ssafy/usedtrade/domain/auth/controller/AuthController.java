package com.ssafy.usedtrade.domain.auth.controller;

import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.auth.dto.request.KakaoTokenRequest;
import com.ssafy.usedtrade.domain.auth.dto.response.LoginResponse;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.auth.service.KakaoOAuthService;
import com.ssafy.usedtrade.domain.user.dto.response.UserInfoResponse;
import com.ssafy.usedtrade.domain.user.entity.User;
import com.ssafy.usedtrade.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final KakaoOAuthService kakaoOAuthService;
    private final UserRepository userRepository;

    @PostMapping("/login/kakao")
    public Api<LoginResponse> socialLogin(@RequestBody KakaoTokenRequest requestDto) {
        return Api.OK(kakaoOAuthService.socialLogin(requestDto.accessToken()));
    }

    @GetMapping("/test")
    public Api<UserInfoResponse> test(@AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        User user = userRepository.findByEmail(memberDetails.getEmail())
                .orElseThrow(IllegalArgumentException::new);

        return Api.OK(UserInfoResponse.builder()
                .email(user.getEmail())
                .nickname(user.getNickname())
                .status(user.getStatus())
                .build());
    }
}

