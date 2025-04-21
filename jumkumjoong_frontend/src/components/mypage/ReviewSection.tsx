// src/components/mypage/ReviewSection.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Review } from '../review/ReviewItem';

const ReviewSection: React.FC = () => {
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
      }
    ];
    
    // 날짜 기준 내림차순 정렬 (최신순)
    const sortedReviews = [...sampleReviews].sort((a, b) => {
      return new Date(b.date.replace(/년|월|일/g, '')).getTime() - 
             new Date(a.date.replace(/년|월|일/g, '')).getTime();
    });
    
    // 최신 3개만 표시
    setReviews(sortedReviews.slice(0, 3));
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
          reviews.map(review => (
            <div key={review.id} className="py-2">
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