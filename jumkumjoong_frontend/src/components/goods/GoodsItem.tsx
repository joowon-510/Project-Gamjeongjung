// src/components/goods/GoodsItem.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../utils/dateFormatter";
import Heart from "../../assets/icons/Heart.svg";
import HeartEmpty from "../../assets/icons/HeartEmpty.svg";
import check from "../../assets/icons/check.svg";
import thumbnail from "../../assets/icons/nologo.svg";
import { postGoodsChangeStatus, postGoodsFavorites } from "../../api/goods";
import { useWishItemStore, WishItemState } from "../../stores/useUserStore";

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
}

export interface GoodsDetailProps {
  userName: string;
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
  deviceImageUrl: string[];
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

  const { items, addItem, removeItem } = useWishItemStore();
  const [favorite, setFavorite] = useState(isFavorite);
  const [status, setStatus] = useState<boolean>(itemStatus);
  const images = deviceImageUrl ? deviceImageUrl : [thumbnail];

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
        removeItem(itemId);
      } else {
        await postGoodsFavorites(itemId);
        const wishItem: WishItemState = {
          createdAt,
          itemId,
          itemName,
          itemPrice,
          itemStatus: status,
        };
        addItem(wishItem);
      }
    } catch (error) {
      console.error("찜 요청 실패:", error);
      setFavorite(exists); // 실패 시 상태 복구
    }
  };

  const handleTransactionClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!canChangeStatus) return;
    e.preventDefault();

    try {
      const newStatus = !status;
      const response = await postGoodsChangeStatus(itemId, newStatus);
      if (response) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("거래 상태 변경 실패:", error);
    }
  };

  const handlePressReview = () => {
    navigate("/reviews/register");
  };

  return (
    <li className="px-4 py-4  border-b last:border-b-0 text-first">
      <Link to={`/goods/detail/${itemId}`} className="flex space-x-4 ">
        {/* 상품 이미지 */}
        <div className="h-24 w-24 flex-shrink-0 bg-gray-100 border rounded -z-10">
          <img
            src={images[0]}
            alt={itemName}
            className={`h-full w-full object-cover ${
              images[0] === thumbnail ? "opacity-50 bg-first/20" : ""
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = thumbnail;
              target.classList.add("opacity-50", "bg-first/20");
            }}
          />
        </div>
        {/* 하트 버튼 (찜하기) */}
        {/* <button
          className="absolute top-0 right-1 p-1 rounded-full"
          onClick={handleFavoriteClick}
        >
          {favorite ? (
            <img src={Heart} alt="Heart" className="w-6 h-6" />
          ) : (
            <img src={HeartEmpty} alt="HeartEmpyt" className="w-6 h-6" />
          )}
        </button> */}

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

        {/* 거래 상태 버튼 */}
        <button
          className="text-[#ffffff] self-end mb-2"
          onClick={handleTransactionClick}
        >
          {status ? (
            <span></span>
          ) : (
            <div className="flex gap-1 justify-center items-center rounded-md bg-second/60 p-[6px]">
              <p>거래 완료</p>
              <img src={check} alt="check" className="w-5 h-5" />
            </div>
          )}
        </button>
      </Link>
      {/* 리뷰 작성 */}
      {!status && canChangeStatus ? (
        <button className="w-full mt-4" onClick={handlePressReview}>
          <div className="flex gap-1 justify-center items-center rounded-md bg-fifth p-[6px]">
            <p className="text-white text-center">리뷰 작성</p>
          </div>
        </button>
      ) : (
        <div></div>
      )}
    </li>
  );
};

export default GoodsItem;
