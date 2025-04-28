package com.ssafy.usedtrade.domain.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@RedisHash("userStatus")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatus {
    @Id
    private Integer userId; // 또는 user:{userId}
    private boolean online;
}