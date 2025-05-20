// src/pages/ReviewListPage.tsx
import React, { useEffect } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import ReviewItem from "../../components/review/ReviewItem";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReviewState, useReviewStore } from "../../stores/useReviewStore";
import { getReview } from "../../api/reviews";

const ReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    userName: string;
    review: ReviewState[];
    userId: number;
  };

  const onGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    fetchReviewData();
    console.log(state.review);
  }, []);

  const fetchReviewData = async () => {
    try {
      const response = await getReview(state.userId);
      console.log(response);
    } catch (error) {
      console.log("review 불러오기 실패: ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더에 hideSearchButton 속성 추가 */}
      <Header showBackButton={true} title="나의 리뷰" hideSearchButton={true} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-baseline">
            <h1 className="text-2xl font-bold mb-4">
              {state.userName} 님의 리뷰
            </h1>
          </div>

          {state.review.length > 0 ? (
            <div className="space-y-3">
              {[...state.review]
                .sort(
                  (a, b) =>
                    new Date(
                      b.createdAt || new Date().toISOString()
                    ).getTime() -
                    new Date(a.createdAt || new Date().toISOString()).getTime()
                )
                .map((review) => (
                  <ReviewItem key={review.createdAt} review={review} />
                ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              작성한 리뷰가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 뒤로가기 버튼 */}
      <button
        onClick={onGoBack}
        className="fixed bottom-[120px] left-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <NavigationBar />
    </div>
  );
};

export default ReviewListPage;
