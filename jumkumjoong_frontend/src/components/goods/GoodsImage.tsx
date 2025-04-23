// src/components/goods/GoodsImage.tsx
import React from 'react';

interface GoodsImageProps {
  imageUrl?: string;
  title: string;
  time: string;  // 'timeAgo'에 해당하는 속성
  onGoBack: () => void;
}

const GoodsImage: React.FC<GoodsImageProps> = ({ 
  imageUrl, 
  title, 
  time, 
  onGoBack 
}) => {
  // 기본 이미지 경로
  const defaultImage = "/goods/default_image.png";

  return (
    <div className="relative w-full">
      {/* 상품 이미지 */}
      <img 
        src={imageUrl || defaultImage} 
        alt={title}
        className="w-full aspect-square object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = defaultImage;
        }}
      />
      
      {/* 상품 제목과 등록 시간 (이미지 위에 오버레이) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">{title}</h1>
          <span>{time}</span>
        </div>
      </div>
      
      {/* 뒤로가기 버튼 */}
      <button 
        onClick={onGoBack}
        className="absolute top-4 left-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
};

export default GoodsImage;