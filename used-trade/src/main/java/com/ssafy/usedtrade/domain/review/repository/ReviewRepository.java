package com.ssafy.usedtrade.domain.review.repository;

import com.ssafy.usedtrade.domain.review.dto.ReviewResponse;
import com.ssafy.usedtrade.domain.review.entity.Review;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Slice<ReviewResponse> findAllBySellerIdOrderByCreatedAtDesc(Integer id);

    @Query("SELECT AVG(r.stars) FROM Review r WHERE r.sellerId = :sellerId")
    Float findAverageStarsBySellerId(Integer sellerId);
}
