package com.ssafy.usedtrade.domain.chat.repository;

import com.ssafy.usedtrade.domain.chat.entity.ReadPoint;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadPointRepository extends JpaRepository<ReadPoint, Long> {
    Optional<ReadPoint> findByUserIdAndRoomId(String userId, String roomId);
}
