package com.ssafy.usedtrade.common.jwt;

import lombok.Builder;

@Builder
public record TokenDto(
	String grantType,
	String accessToken,
	String refreshToken,
	Long expiresIn
) {
}

