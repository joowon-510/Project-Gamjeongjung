// src/components/goods/GoodsItem.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export interface GoodsItemProps {
  id: number;
  title: string;
  price: string;
  time: string;
  seller: string;
  imageUrl?: string;
}

const GoodsItem: React.FC<GoodsItemProps> = ({ id, title, price, time, seller, imageUrl }) => {
  // 기본 이미지 URL (public 폴더에 default_image.png 파일을 추가해야 함)
  const defaultImage = '/goods/default_image.png';

  return (
    <li className="px-4 py-4 bg-white">
      <Link to={`/goods/detail/${id}`} className="flex space-x-4">
        {/* 상품 이미지 */}
        <div className="h-24 w-24 flex-shrink-0 bg-gray-100 border rounded overflow-hidden">
          <img 
            src={imageUrl || defaultImage} 
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = defaultImage;
            }}
          />
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          {/* 상품 제목 */}
          <div className="text-lg font-medium text-gray-900">{title}</div>
          
          {/* 상품 가격 */}
          <div className="text-xl font-bold text-gray-900 mt-1">{price}</div>
          
          {/* 등록 시간과 판매자 닉네임을 같은 행의 양 끝으로 배치 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
            <span>{time}</span>
            <span>{seller}</span>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default GoodsItem;