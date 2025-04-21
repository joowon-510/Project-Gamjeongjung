package com.ssafy.usedtrade.domain.user.dto.response;

import lombok.Builder;

@Builder
public record UserInfoResponse(String email, String nickname, int status) {

}
