// src/pages/FavoritePage.tsx
import React, { useEffect } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import GoodsItem from "../../components/goods/GoodsItem";
import { getGoodsFavorites } from "../../api/goods";
import { useAuthStore } from "../../stores/useUserStore";

const FavoritePage: React.FC = () => {
  const userInfo = useAuthStore();
  console.log(userInfo.nickname);
  // 목업 데이터 - 실제 구현에서는 API 호출이나 상태 관리를 통해 가져와야 함
  const favoriteItems = [
    {
      id: 1,
      title: "갤럭5(S급) 팝니다",
      price: "96만원",
      time: "2시간전",
      seller: "재드래곤",
      imageUrl: "/path/to/galaxy5.jpg",
      isFavorite: true,
    },
    {
      id: 2,
      title: "맥북pro 팔아용",
      price: "96만원",
      time: "16시간전",
      seller: "AI의신예훈",
      imageUrl: "/path/to/macbook.jpg",
      isFavorite: true,
    },
    {
      id: 3,
      title: "갤럭5(S급) 팝니다",
      price: "96만원",
      time: "1일전",
      seller: "AI의신예훈",
      imageUrl: "/path/to/galaxy5_2.jpg",
      isFavorite: true,
    },
  ];

  useEffect(() => {
    const data = getGoodsFavorites();
    console.log(data);
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* 기존 Header 컴포넌트 사용 */}
      <Header />

      {/* 찜한 목록 제목 */}
      <div className="px-4 py-6 bg-white">
        <h1 className="text-2xl font-bold">
          {userInfo.nickname}님의 찜한 목록
        </h1>
      </div>

      {/* 찜한 상품 목록 */}
      <ul className="mt-1 divide-y divide-gray-200">
        {favoriteItems.map((item) => (
          <GoodsItem
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            time={item.time}
            seller={item.seller}
            imageUrl={item.imageUrl}
            isFavorite={item.isFavorite}
          />
        ))}
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
