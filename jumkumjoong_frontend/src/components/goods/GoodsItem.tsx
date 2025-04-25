// src/components/goods/GoodsItem.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../utils/dateFormatter";

export interface GoodsItemProps {
  createdAt: string;
  itemId: number;
  itemName: string;
  itemPrice: number;
  itemStatus: boolean;
  imageUrl?: string;
  isFavorite?: boolean;
}

const GoodsItem: React.FC<GoodsItemProps> = ({
  // id,
  // title,
  // price,
  // time,
  // seller,
  createdAt,
  itemId,
  itemName,
  itemPrice,
  itemStatus,
  imageUrl,
  isFavorite = false,
}) => {
  // 로컬 상태로 찜하기 여부 관리 (목업용)
  const [favorite, setFavorite] = useState(isFavorite);

  // 기본 이미지 URL (public 폴더에 default_image.png 파일을 추가해야 함)
  const defaultImage = "/goods/default_image.png";

  // 찜하기 버튼 클릭 핸들러 (목업용)
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 링크 이동 방지
    setFavorite(!favorite);
  };

  return (
    <li className="px-4 py-4 bg-white border-b last:border-b-0">
      <Link to={`/goods/detail/${itemId}`} className="flex space-x-4 relative">
        {/* 상품 이미지 */}
        <div className="h-24 w-24 flex-shrink-0 bg-gray-100 border rounded overflow-hidden relative">
          <img
            src={imageUrl || defaultImage}
            alt={itemName}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = defaultImage;
            }}
          />

          {/* 하트 버튼 (찜하기) - 이미지 위에 겹쳐서 표시 */}
          <button
            className="absolute bottom-1 right-1 p-1 rounded-full"
            onClick={handleFavoriteClick}
          >
            {favorite ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#f87171"
                className="w-6 h-6"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#f87171"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          {/* 상품 제목 */}
          <div className="text-lg font-medium text-gray-900">{itemName}</div>

          {/* 상품 가격 */}
          <div className="text-xl font-bold text-gray-900 mt-1">
            {itemPrice}
          </div>

          {/* 등록 시간과 판매자 닉네임을 같은 행의 양 끝으로 배치 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
            {/* <span>{createdAt}</span> */}
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default GoodsItem;
