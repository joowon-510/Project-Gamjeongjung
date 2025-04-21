// src/pages/ReviewListPage.tsx
import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import NavigationBar from '../../components/common/NavigationBar';
import ReviewItem, { Review } from '../../components/review/ReviewItem';

const ReviewListPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  // 샘플 리뷰 데이터를 가져오는 함수 (실제로는 API 호출)
  useEffect(() => {
    // 실제 구현에서는 API 호출로 대체
    const sampleReviews: Review[] = [
      {
        id: 1,
        content: '물건을 빨리 주셔서 좋았어요~!!',
        rating: 4.5,
        date: '2025년 1월 21일'
      },
      {
        id: 2,
        content: '물건을 빨리',
        rating: 5,
        date: '2025년 1월 5일'
      },
      {
        id: 3,
        content: '좋은 물건을 싸게 팔아서 너무 감사해요!!!',
        rating: 4,
        date: '2024년 11월 21일'
      },
      {
        id: 4,
        content: '배송이 조금 늦었지만 물건은 좋아요',
        rating: 3.5,
        date: '2024년 10월 15일'
      },
      {
        id: 5,
        content: '판매자분이 너무 친절해요! 다음에 또 거래하고 싶어요',
        rating: 5,
        date: '2024년 9월 30일'
      }
    ];
    
    // 날짜 기준 내림차순 정렬 (최신순)
    const sortedReviews = [...sampleReviews].sort((a, b) => {
      return new Date(b.date.replace(/년|월|일/g, '')).getTime() - 
             new Date(a.date.replace(/년|월|일/g, '')).getTime();
    });
    
    setReviews(sortedReviews);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더에 hideSearchButton 속성 추가 */}
      <Header showBackButton={true} title="나의 리뷰" hideSearchButton={true} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">나의 리뷰</h1>
          
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              작성한 리뷰가 없습니다.
            </div>
          )}
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default ReviewListPage;