package com.ssafy.usedtrade.common.jwt;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional
@Service
public class RefreshTokenService {

	private final RefreshTokenRepository repository;

	public void saveRefreshToken(String token, Long ttl) {
		repository.save(new RefreshToken(token, ttl));
	}

	public void removeRefreshToken(String token) {
		RefreshToken refreshToken = repository
			.findByToken(token)
			.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 토큰입니다."));

		repository.delete(refreshToken);
	}

	public boolean hasRefreshToken(String token) {
		return repository.existsByToken(token);
	}
}

