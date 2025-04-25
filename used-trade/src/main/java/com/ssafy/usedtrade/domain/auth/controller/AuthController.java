package com.ssafy.usedtrade.domain.auth.controller;

import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.auth.dto.request.KakaoTokenRequest;
import com.ssafy.usedtrade.domain.auth.dto.response.LoginResponse;
import com.ssafy.usedtrade.domain.auth.service.KakaoOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final KakaoOAuthService kakaoOAuthService;

    @PostMapping("/login/kakao")
    public Api<LoginResponse> socialLogin(@RequestBody KakaoTokenRequest requestDto) {
        return Api.OK(kakaoOAuthService.socialLogin(requestDto.accessToken()));
    }
}

