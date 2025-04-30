// src/components/review/ReviewItem.tsx
import React from "react";
import star from "../../assets/icons/starFilled.svg";

export interface Review {
  id: number;
  content: string;
  rating: number;
  date: string;
}

interface ReviewItemProps {
  review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  return (
    <div className="p-4 bg-white rounded-lg mb-3 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img src={star} alt="star" className="w-5 h-5" />
          <span className="ml-1 font-bold">{review.rating}</span>
        </div>
        <div className="text-gray-500 text-sm">{review.date}</div>
      </div>
      <div className="flex justify-between items-start">
        <div className="text-lg">{review.content}</div>
      </div>
    </div>
  );
};

export default ReviewItem;
