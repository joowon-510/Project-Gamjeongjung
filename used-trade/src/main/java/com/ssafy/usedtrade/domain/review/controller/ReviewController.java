package com.ssafy.usedtrade.domain.review.controller;

import com.ssafy.usedtrade.common.response.Api;
import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;
import com.ssafy.usedtrade.domain.review.dto.ReviewRequest;
import com.ssafy.usedtrade.domain.review.dto.ReviewResponse;
import com.ssafy.usedtrade.domain.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public Api<Void> saveReview(
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        reviewService.saveReview(request, memberDetails.getId());
        return Api.OK();
    }

    @GetMapping
    public Api<Slice<ReviewResponse>> findAllReview(
            @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        return Api.OK(reviewService.findAllReview(memberDetails.getId()));
    }

    @GetMapping("/stars")
    public Api<Float> countAllReview(
            @AuthenticationPrincipal SecurityMemberDetails memberDetails) {
        return Api.OK(reviewService.countAllReview(memberDetails.getId()));
    }
}
