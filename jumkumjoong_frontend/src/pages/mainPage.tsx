import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/common/Header";
import NavigationBar from "../components/common/NavigationBar";
import { getUserInfo } from "../api/users";
import {
  getGoodsFavorites,
  getGoodsRecent,
  getGoodsSearch,
} from "../api/goods";

// 상태관리 임포트
import { useAuthStore, useWishItemStore } from "../stores/useUserStore";

import laptop from "../assets/icons/laptop.svg";
import keyboard from "../assets/icons/keyboard.svg";
import phone from "../assets/icons/phone.svg";
import tablet from "../assets/icons/tablet.svg";
import heart from "../assets/icons/Heart.svg";
import newGoods from "../assets/icons/new.svg";
// 썸네일 이미지 임포트
import thumbnail from "../assets/goods/thumbnail.png";
import thumbnail2 from "../assets/goods/thumbnail2.png";
import thumbnail3 from "../assets/goods/thumbnail3.png";
import thumbnail4 from "../assets/goods/thumbnail4.png";

const categories = [
  { id: "laptop", label: "노트북", icon: laptop },
  { id: "keyboard", label: "키보드", icon: keyboard },
  { id: "phone", label: "휴대폰", icon: phone },
  { id: "tablet", label: "태블릿", icon: tablet },
];

// const popularItems = [
//   { img: thumbnail2, title: "갤북5(S)급 팝니다" },
//   { img: thumbnail3, title: "맥북pro 팔아용" },
//   { img: thumbnail4, title: "갤북4 싸게 팝니다" },
//   { img: thumbnail5, title: "그램 14인치" },
// ];

// const recentItems = [
//   { img: thumbnail, title: "갤북5(S)급 팝니다" },
//   { img: thumbnail2, title: "맥북pro 팔아용" },
//   { img: thumbnail3, title: "갤북4 싸게 팝니다" },
//   { img: thumbnail4, title: "그램 14인치" },
// ];

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentItems, setRecentItem] = useState<
    { img: string; title: string; id: number }[]
  >([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getUserInfo();
        console.log("User: ", useAuthStore.getState());
        const wishItem = await getGoodsFavorites();
        useWishItemStore.getState().setItems(wishItem);
        console.log("Wish item: ", useWishItemStore.getState().items);

        if (!user) {
          // navigate("/login");

          return;
        }
      } catch (error) {}
    };

    const checkGoods = async () => {
      try {
        const goods = await getGoodsRecent();
        console.log("goods: ", goods);
        if (!goods) {
          setRecentItem([]);
        }
        const parsedItems = goods.map((item: any) => ({
          img: item.imageUrl || thumbnail, // 실제로는 item.imageUrl 같은 값이 들어가야 할 수도 있음
          id: item.itemId,
          title: item.itemName,
        }));
        setRecentItem(parsedItems);
      } catch (error) {
        console.log("상품 불러오기 실패:", error);
      }
    };

    checkUser();
    checkGoods();
  }, [navigate]);

  const handleCategoryClick = (category: string) => {
    navigate("/goods/list", { state: category });
  };

  const wishItems = useWishItemStore.getState().items.map((item) => ({
    img: thumbnail,
    title: item.itemName,
    id: item.itemId,
  }));

  const renderItemGrid = (
    items: { img: string; title: string; id: number }[],
    key: "recent" | "wish"
  ) => {
    const mention =
      key === "recent"
        ? "등록된 상품이 없습니다."
        : useAuthStore.getState().nickname
        ? "찜한 상품이 없습니다.\n상품을 보러가볼까요?"
        : "로그인이 필요한 서비스입니다.\n로그인해주세요.";
    return (
      <div className=" my-2 flex items-center">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 ">
            {items.map((item, idx) => (
              <div
                key={idx}
                className=""
                onClick={() => {
                  navigate(`/goods/detail/${item.id}`);
                }}
              >
                <img
                  src={item.img}
                  alt={`thumbnail-${idx}`}
                  className=" rounded-xl"
                />
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="whitespace-pre-wrap w-full border-l pl-4 py-2 border-l-4">
            {mention}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen text-first">
      <Header title="LOGO" showBackButton={false} hideSearchButton={false} />

      <main className="flex-1 overflow-auto pb-[150px] font-semibold flex flex-col gap-4">
        {/* <main className="font-semibold flex flex-col gap-4 mb-4 flex-1 overflow-y-auto"> */}
        {/* 카테고리 */}
        <article className="px-4 py-2 text-first">
          <p className="text-center text-[20px] my-3">
            내가 찾는 중고 물품을 찾아보세요.
          </p>
          <div className="flex gap-4">
            {/* 각 카테고리 */}
            {categories.map(({ id, label, icon }) => (
              <div
                key={id}
                className="w-full h-fit bg-fourth px-2 rounded-lg cursor-pointer"
                onClick={() => handleCategoryClick(id)}
              >
                <img src={icon} alt={id} className="w-[96px]" />
                <p className="text-center pb-2">{label}</p>
              </div>
            ))}
          </div>
        </article>

        {/* 찜한 아이템 중 거래 중인 상품 */}
        <article className=" mx-4 border-b pb-5">
          <div className="flex gap-2 pb-2">
            <img src={heart} alt="heart" className="w-5" />
            <p className=" text-[20px]">내가 찜한 아이템</p>
          </div>
          {renderItemGrid(wishItems, "wish")}
        </article>

        {/* 최근 등록된 아이템 */}
        <article className="mx-4">
          <div className="flex gap-2 items-center pb-2">
            <img src={newGoods} alt="new" className="w-7" />
            <p className="text-[20px]">방금 등록된 아이템</p>
          </div>
          {renderItemGrid(recentItems, "recent")}
        </article>
      </main>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <NavigationBar />
      </div>
    </div>
  );
};

export default MainPage;
