package com.ssafy.usedtrade.domain.review.entity;

import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    private SalesItem item;

    private Integer sellerId;

    private Integer reviewerId;

    private String content;

    private float stars;

    private LocalDateTime createdAt;
}
