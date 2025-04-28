// src/pages/FavoritePage.tsx
import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import GoodsItem from "../../components/goods/GoodsItem";
import { getGoodsFavorites } from "../../api/goods";
import { useAuthStore, useWishItemStore } from "../../stores/useUserStore";

const FavoritePage: React.FC = () => {
  const userInfo = useAuthStore();
  const { items, addItem, removeItem } = useWishItemStore();
  // const [favoriteItems, setFavoriteItems] = useState<any>([]);
  // 목업 데이터 - 실제 구현에서는 API 호출이나 상태 관리를 통해 가져와야 함
  // const favoriteItems = [
  //   {
  //     id: 1,
  //     title: "갤럭5(S급) 팝니다",
  //     price: "96만원",
  //     time: "2시간전",
  //     seller: "재드래곤",
  //     imageUrl: "/path/to/galaxy5.jpg",
  //     isFavorite: true,
  //   },
  //   {
  //     id: 2,
  //     title: "맥북pro 팔아용",
  //     price: "96만원",
  //     time: "16시간전",
  //     seller: "AI의신예훈",
  //     imageUrl: "/path/to/macbook.jpg",
  //     isFavorite: true,
  //   },
  //   {
  //     id: 3,
  //     title: "갤럭5(S급) 팝니다",
  //     price: "96만원",
  //     time: "1일전",
  //     seller: "AI의신예훈",
  //     imageUrl: "/path/to/galaxy5_2.jpg",
  //     isFavorite: true,
  //   },
  // ];

  // useEffect(() => {
  //   const fetchFavorites = async () => {
  //     try {
  //       const data = await getGoodsFavorites(); // ✅ 비동기 처리
  //       setFavoriteItems(data);
  //       console.log("찜한 상품 목록:", data);
  //     } catch (error) {
  //       console.log("찜 목록 로딩 실패:", error);
  //       setFavoriteItems([]); // 에러 시 비워주기
  //     }
  //   };

  //   fetchFavorites();
  // }, []);

  return (
    <div className="text-first min-h-screen pb-16">
      {/* 기존 Header 컴포넌트 사용 */}
      <Header />

      {/* 찜한 목록 제목 */}
      <div className="px-4 py-6 bg-white">
        <h1 className="text-2xl font-bold">
          {userInfo.nickname ?? "user"} 님의 찜한 목록
        </h1>
      </div>

      {/* 찜한 상품 목록 */}
      <ul className="mt-1 divide-y divide-gray-200">
        {items.length > 0 ? (
          items.map((item: any) => (
            <GoodsItem
              key={item.id}
              itemId={item.id}
              itemName={item.title}
              itemPrice={item.price}
              createdAt={item.time}
              itemStatus={item.itemStatus}
              // seller={item.seller}
              imageUrl={item.imageUrl}
              isFavorite={item.isFavorite}
            />
          ))
        ) : (
          <p className="p-4 text-center text-first/50">찜한 상품이 없습니다.</p>
        )}
      </ul>

      {/* 여백 추가 */}
      <div className="h-16"></div>

      {/* 기존 NavigationBar 컴포넌트를 고정 위치로 사용 */}
      <div className="fixed bottom-0 left-0 w-full">
        <NavigationBar />
      </div>
    </div>
  );
};

export default FavoritePage;
