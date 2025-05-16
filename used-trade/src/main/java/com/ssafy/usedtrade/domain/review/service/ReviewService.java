package com.ssafy.usedtrade.domain.review.service;

import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.repository.ItemSalesRepository;
import com.ssafy.usedtrade.domain.review.dto.ReviewRequest;
import com.ssafy.usedtrade.domain.review.dto.ReviewResponse;
import com.ssafy.usedtrade.domain.review.entity.Review;
import com.ssafy.usedtrade.domain.review.repository.ReviewRepository;
import jakarta.annotation.Nullable;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ItemSalesRepository itemSalesRepository;

    public void saveReview(ReviewRequest request, Integer id) {
        SalesItem salesItem = itemSalesRepository.findById(request.itemId())
                .orElseThrow(() -> new IllegalArgumentException("아이템이 존재하지 않습니다."));

        reviewRepository.save(
                Review.builder()
                        .item(salesItem)
                        .sellerId(salesItem.getUserId())
                        .reviewerId(id)
                        .content(request.content())
                        .stars(request.stars())
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    public Slice<ReviewResponse> findAllReview(
            Integer id,
            LocalDateTime createdAt,
            @Nullable String sellerId
    ) {
        PageRequest pageable =
                PageRequest.of(
                        0,
                        10,
                        Sort.by(Sort.Direction.DESC, "createdAt"));

        if (createdAt == null) {
            return sellerId == null
                    ? reviewRepository.findAllBySellerIdOrderByCreatedAtDesc(id, pageable)
                    .map(entity -> {
                        return ReviewResponse.builder()
                                .content(entity.content())
                                .stars(entity.stars())
                                .createdAt(entity.createdAt())
                                .build();
                    })
                    : reviewRepository.findAllBySellerIdOrderByCreatedAtDesc(
                                    Integer.valueOf(sellerId),
                                    pageable
                            )
                            .map(entity -> {
                                return ReviewResponse.builder()
                                        .content(entity.content())
                                        .stars(entity.stars())
                                        .createdAt(entity.createdAt())
                                        .build();
                            });
        }

        return sellerId == null
                ? reviewRepository.findAllBySellerIdAndCreatedAtBeforeOrderByCreatedAtDesc(id, createdAt, pageable)
                .map(entity -> {
                    return ReviewResponse.builder()
                            .content(entity.content())
                            .stars(entity.stars())
                            .createdAt(entity.createdAt())
                            .build();
                })
                : reviewRepository.findAllBySellerIdAndCreatedAtBeforeOrderByCreatedAtDesc(
                                Integer.valueOf(sellerId), createdAt, pageable)
                        .map(entity -> {
                            return ReviewResponse.builder()
                                    .content(entity.content())
                                    .stars(entity.stars())
                                    .createdAt(entity.createdAt())
                                    .build();
                        });
    }

    public float countAllReview(Integer id, @Nullable String sellerId) {
        return sellerId == null
                ? reviewRepository.findAverageStarsBySellerId(id)
                : reviewRepository.findAverageStarsBySellerId(Integer.valueOf(sellerId));
    }
}
