package com.ssafy.usedtrade.domain.websocket.redis.repository;

import com.ssafy.usedtrade.domain.websocket.redis.entity.UserStatus;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatusRepository extends CrudRepository<UserStatus, Integer> {
}
