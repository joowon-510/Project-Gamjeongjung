package com.ssafy.usedtrade.domain.user.dto.request;

import lombok.Builder;

@Builder
public record updateUserInfoNicknameRequest(String nickname) {
}
