// src/pages/MyPage.tsx
import React from 'react';
import Header from '../../components/common/Header';
import NavigationBar from '../../components/common/NavigationBar';
import ProfileSection from '../../components/mypage/ProfileSection';
import PriceSection from '../../components/mypage/PriceSection';
import ReviewSection from '../../components/mypage/ReviewSection';
import ActionSection from '../../components/mypage/ActionSection';

const MyPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더 - 로그아웃 버튼 표시 */}
      <Header showLogout={true} />
      
      <div className="flex-1 overflow-y-auto">
        {/* 컨텐츠 영역에 좌우 여백 적용 */}
        <div className="max-w-md mx-auto px-4">
          {/* 프로필 섹션 */}
          <ProfileSection username="재드래곤" rating={4.5} />
          
          {/* 가격 섹션 */}
          <PriceSection price={340000} />
          
          {/* 리뷰 섹션 */}
          <ReviewSection />
          
          {/* 액션 섹션 (거래 내역, 찜한 목록, 내가 작성한 글) */}
          <ActionSection />
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default MyPage;