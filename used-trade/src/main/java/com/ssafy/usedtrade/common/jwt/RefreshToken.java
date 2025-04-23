package com.ssafy.usedtrade.common.jwt;

import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import jakarta.persistence.Id;
import lombok.Getter;

@Getter
@RedisHash(value = "refresh_token")
public class RefreshToken {

	@Id
	private Long id;

	@Indexed
	private String token;

	@TimeToLive
	private Long ttl;

	public RefreshToken(String token, Long ttl) {
		this.token = token;
		this.ttl = ttl;
	}
}


