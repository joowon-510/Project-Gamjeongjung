package com.ssafy.usedtrade.domain.review.repository;

import com.ssafy.usedtrade.domain.review.dto.ReviewResponse;
import com.ssafy.usedtrade.domain.review.entity.Review;
import java.time.LocalDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Slice<ReviewResponse> findAllBySellerIdAndCreatedAtBeforeOrderByCreatedAtDesc(Integer id, LocalDateTime createAt,
                                                                                  Pageable pageable);

    Slice<ReviewResponse> findAllBySellerIdOrderByCreatedAtDesc(Integer id, Pageable pageable);

    @Query("SELECT AVG(r.stars) FROM Review r WHERE r.sellerId = :sellerId")
    Float findAverageStarsBySellerId(Integer sellerId);
}
