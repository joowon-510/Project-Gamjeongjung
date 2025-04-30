// src/components/mypage/ReviewSection.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReviewState, useReviewStore } from "../../stores/useReviewStore";
import { formatDateManually } from "../../utils/dateFormatter";

const ReviewSection: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewState[]>([]);
  const reviewInfo = useReviewStore();

  // 샘플 리뷰 데이터를 가져오는 함수 (실제로는 API 호출)
  useEffect(() => {
    // 최신 3개만 표시
    setReviews(reviewInfo.content.slice(0, 3));
  }, []);

  return (
    <div className="bg-white rounded-lg mt-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">리뷰</h2>
        <Link to="/reviews" className="text-gray-500 text-sm">
          전체 보기
        </Link>
      </div>

      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.createdAt} className="py-2">
              <div>
                {review.createdAt ? (
                  formatDateManually(review.createdAt).date
                ) : (
                  <p>--</p>
                )}
              </div>
              <div className="text-gray-800">{review.content}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-2 text-gray-500">
            작성된 리뷰가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
