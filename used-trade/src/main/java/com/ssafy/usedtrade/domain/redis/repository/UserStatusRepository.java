package com.ssafy.usedtrade.domain.redis.repository;

import com.ssafy.usedtrade.domain.redis.entity.UserStatus;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatusRepository extends CrudRepository<UserStatus, Integer> {
}
