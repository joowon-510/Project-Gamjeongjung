// src/components/goods/GoodsItem.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../utils/dateFormatter";
import Heart from "../../assets/Heart.svg";
import HeartEmpty from "../../assets/HeartEmpty.svg";
import { postGoodsFavorites } from "../../api/goods";
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
}

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
  const { items, addItem, removeItem } = useWishItemStore();
  console.log("찜목록: ", items);

  useEffect(() => {
    if (!itemId) return;

    // 현재 상품이 찜 목록에 있는지 확인
    const exists = items.some((item) => item.itemId === itemId);
    // const exists = items.some((item) => item.itemId === parseInt(itemId));
    setFavorite(exists);
  }, [itemId, items]);

  // 찜하기 버튼 클릭 핸들러 (목업용)
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // 링크 이동 방지

    if (!itemId) {
      console.error("itemId가 없습니다.");
      return;
    }

    const exists = items.some((item) => item.itemId === itemId);

    const wishItem: WishItemState = {
      createdAt: createdAt,
      itemId: itemId,
      itemName: itemName,
      itemPrice: itemPrice,
      itemStatus: itemStatus,
    };

    // ✅ 하트 아이콘을 "바로" 바꾼다
    setFavorite(!exists);

    // 찜 요청 api 연결
    try {
      if (exists) {
        removeItem(wishItem.itemId);
        console.log("찜 해제 요청 보내는 중...");
      } else {
        console.log("찜 추가 요청 보내는 중...");
        await postGoodsFavorites(itemId);
        addItem(wishItem);
      }
    } catch (error) {
      console.log("찜 요청 실패: ", error);

      setFavorite(exists); // 실패했으면 다시 원래대로
    }
  };

  // 기본 이미지 URL (public 폴더에 default_image.png 파일을 추가해야 함)
  const defaultImage = "/goods/default_image.png";

  // 찜하기 버튼 클릭 핸들러 (목업용)
  // const handleFavoriteClick = (e: React.MouseEvent) => {
  //   e.preventDefault(); // 링크 이동 방지
  //   setFavorite(!favorite);
  // };

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
        </div>
        {/* 하트 버튼 (찜하기) - 이미지 위에 겹쳐서 표시 */}
        <button
          className="absolute top-0 right-1 p-1 rounded-full"
          onClick={handleFavoriteClick}
        >
          {favorite ? (
            <img src={Heart} alt="Heart" className="w-6 h-6" />
          ) : (
            <img src={HeartEmpty} alt="HeartEmpyt" className="w-6 h-6" />
          )}
        </button>

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
