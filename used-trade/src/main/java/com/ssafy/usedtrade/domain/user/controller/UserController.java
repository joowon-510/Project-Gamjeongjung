package com.ssafy.usedtrade.domain.user.controller;

import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.user.dto.request.updateUserInfoNicknameRequest;
import com.ssafy.usedtrade.domain.user.dto.response.UserInfoResponse;
import com.ssafy.usedtrade.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequestMapping("/api/users")
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public Api<UserInfoResponse> findUserInfo(
            @AuthenticationPrincipal SecurityMemberDetails memberDetails
    ) {
        return Api.OK(userService.findUserInfo(memberDetails.getEmail()));
    }

    @PatchMapping
    public Api<Void> updateUserInfoNickname(
            @AuthenticationPrincipal SecurityMemberDetails memberDetails,
            @RequestBody updateUserInfoNicknameRequest updateUserInfoNicknameRequest
    ) {
        userService.updateUserInfoNickname(memberDetails.getEmail(), updateUserInfoNicknameRequest);
        return Api.OK();
    }
}
