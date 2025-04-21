// src/components/mypage/ReviewSection.tsx
import React from 'react';

interface Review {
  id: number;
  author: string;
  content: string;
}

const ReviewSection: React.FC = () => {
  // 샘플 리뷰 데이터
  const reviews: Review[] = [
    { id: 1, author: '???', content: '좋은 제품을 싸게 팔아요!' },
    { id: 2, author: '???', content: '답장이 빨라서 좋아요~!!' },
    { id: 3, author: '???', content: '거래를 빠르게 해서 좋아요!' },
  ];

  return (
    <div className="bg-white rounded-lg mt-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">리뷰</h2>
        <button className="text-gray-500 text-sm">전체 보기</button>
      </div>
      
      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 mr-2"></div>
            <div>
              <span className="text-gray-500">{review.author} : </span>
              <span>{review.content}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;