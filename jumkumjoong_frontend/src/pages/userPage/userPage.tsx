// src/pages/MyPage.tsx
import React, { useEffect, useState } from "react";

import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import ProfileSection from "../../components/mypage/ProfileSection";
import ReviewSection from "../../components/mypage/ReviewSection";
import ActionSection from "../../components/mypage/ActionSection";

import { getReview } from "../../api/reviews";
import { useLocation } from "react-router-dom";

const UserPage: React.FC = () => {
  const [review, setReview] = useState<[]>([]);

  const location = useLocation();

  const state = location.state as {
    userName: string;
    userRating: number;
    userId: number;
  };

  useEffect(() => {
    loadReviewData();
    console.log(review);
  }, []);

  const loadReviewData = async () => {
    try {
      const response = await getReview(state.userId);
      console.log(response);

      if (response) {
        setReview(response);
      }
    } catch (error) {
      console.log("리뷰 로딩 실패: ", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-first">
      {/* 헤더 - 로그아웃 버튼 표시 */}
      <Header hideSearchButton={true} />

      <div className="flex-1 overflow-y-auto">
        {/* 컨텐츠 영역에 좌우 여백 적용 */}
        <div className="max-w-md mx-auto px-4">
          {/* 프로필 섹션 */}
          <ProfileSection
            username={state ? state.userName : "user123"}
            rating={state.userRating}
          />

          {/* 리뷰 섹션 */}
          <ReviewSection
            review={review}
            userName={state.userName}
            userId={state.userId}
          />

          {/* 액션 섹션 (거래 내역, 찜한 목록, 내가 작성한 글) */}
          <ActionSection
            userId={state.userId}
            userName={state.userName}
            userRating={state.userRating}
          />
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default UserPage;
