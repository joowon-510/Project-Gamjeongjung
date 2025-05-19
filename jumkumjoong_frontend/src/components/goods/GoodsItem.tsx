// src/components/goods/GoodsItem.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import thumbnail from "../../assets/icons/nologo.svg";
import Heart from "../../assets/icons/Heart.svg";
import HeartEmpty from "../../assets/icons/HeartEmpty.svg";

import {
  // postGoodsChangeStatus,
  postGoodsFavorites,
} from "../../api/goods";
import { useWishItemStore, WishItemState } from "../../stores/useUserStore";
import { formatRelativeTime } from "../../utils/dateFormatter";

export interface GoodsItemDetailProps {
  configuration: number;
  createdAt: string;
  description: string;
  grades: boolean;
  itemId: number;
  price: number;
  purchaseDate: string;
  scratchesStatus: string;
  serialNumber: string | null;
  status: boolean;
  title: string;
  userId: number;
  deviceImageUrl: string[];
}

export interface GoodsDetailProps {
  userName: string;
  userRating: number;
  item: GoodsItemDetailProps;
  isFavorite: boolean;
}

export interface GoodsItemProps {
  createdAt: string;
  itemId: number;
  itemName: string;
  itemPrice: number;
  itemStatus: boolean;
  imageUrl?: string;
  isFavorite?: boolean;
  canChangeStatus?: boolean; // ✅ 추가: 거래 상태 변경 가능 여부
  deviceImageUrl: string;
}

const GoodsItem: React.FC<GoodsItemProps> = ({
  createdAt,
  itemId,
  itemName,
  itemPrice,
  itemStatus,
  isFavorite = false,
  canChangeStatus, // ✅ 기본값 false
  deviceImageUrl,
}) => {
  const navigate = useNavigate();

  const { items, removeItem, addItem } = useWishItemStore();
  const [favorite, setFavorite] = useState(isFavorite);
  const [status, setStatus] = useState<boolean>(itemStatus);
  const images = deviceImageUrl ? deviceImageUrl : thumbnail;

  useEffect(() => {
    const exists = items.some((item) => item.itemId === itemId);
    setFavorite(exists);
  }, [items, itemId]);

  // 찜하기 버튼 클릭 핸들러 (목업용)
  const handleFavoriteClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault(); // 링크 이동 방지

    if (!itemId) {
      console.error("itemId가 없습니다.");
      return;
    }
    const exists = items.some((item) => item.itemId === itemId);
    setFavorite(!exists);

    try {
      if (exists) {
        await postGoodsFavorites(itemId);
        removeItem(itemId);
      } else {
        await postGoodsFavorites(itemId);
        const wishItem: WishItemState = {
          createdAt,
          itemId,
          itemName,
          itemPrice,
          itemStatus: status,
          deviceImageUrl,
        };
        addItem(wishItem);
      }
    } catch (error) {
      console.error("찜 요청 실패:", error);
      setFavorite(exists); // 실패 시 상태 복구
    }
  };

  return (
    <li className="px-4 py-4  border-b last:border-b-0 text-first bg-white mx-2 rounded-md">
      <Link to={`/goods/detail/${itemId}`} className="flex space-x-4 ">
        {/* 상품 이미지 */}
        <div className="h-24 w-24 flex-shrink-0 bg-gray-100 border rounded ">
          <img
            src={images}
            alt={itemName}
            className={`h-full w-full object-cover ${
              images === thumbnail ? "opacity-50 bg-first/20" : ""
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = thumbnail;
              // target.classList.add("opacity-50", "bg-first/20");
            }}
          />
        </div>

        {/* 상품 정보 */}
        <div className="flex-1 flex flex-col justify-between">
          {/* 상품 제목 */}
          {itemName.length > 30 ? (
            <div className="text-lg font-medium text-gray-900">
              {itemName.slice(0, 22)} ...
            </div>
          ) : (
            <div className="text-lg font-medium text-gray-900">{itemName}</div>
          )}

          {/* 상품 가격 */}
          <div className="text-xl font-bold text-gray-900 mt-1">
            {itemPrice} 원
          </div>

          {/* 등록 시간과 판매자 닉네임을 같은 행의 양 끝으로 배치 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>

        {/* 하트 버튼 (찜하기) */}
        <button
          className="self-start py-1"
          // className="absolute top-0 right-1 p-1 rounded-full"
          onClick={handleFavoriteClick}
        >
          {favorite ? (
            <img src={Heart} alt="Heart" className="w-6 h-6" />
          ) : (
            <img src={HeartEmpty} alt="HeartEmpyt" className="w-6 h-6" />
          )}
        </button>
      </Link>
    </li>
  );
};

export default GoodsItem;
