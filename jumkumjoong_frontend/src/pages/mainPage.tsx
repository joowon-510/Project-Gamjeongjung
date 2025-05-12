import React, { useEffect } from "react";
import laptop from "../assets/icons/laptop.svg";
import keyboard from "../assets/icons/keyboard.svg";
import phone from "../assets/icons/phone.svg";
import tablet from "../assets/icons/tablet.svg";
import NavigationBar from "../components/common/NavigationBar";
import Header from "../components/common/Header";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../api/users";

// 상태관리 임포트
import { useAuthStore, useWishItemStore } from "../stores/useUserStore";

// 썸네일 이미지 임포트
import thumbnail from "../assets/goods/thumbnail.png";
import thumbnail2 from "../assets/goods/thumbnail2.png";
import thumbnail3 from "../assets/goods/thumbnail3.png";
import thumbnail4 from "../assets/goods/thumbnail4.png";
import thumbnail5 from "../assets/goods/thumbnail5.png";
import { getGoodsFavorites } from "../api/goods";

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const fetchUser = async () => {
    const response = await getUserInfo();
    if (!response) {
      return null;
    }
    return response;
  };
  const fetchWish = async () => {
    const response = await getGoodsFavorites();
    if (!response) {
      return null;
    }
    return response;
  };
  useEffect(() => {
    const checkUser = async () => {
      const data = await fetchUser();

      if (!data) {
        navigate("/login");
      } else {
        console.log("User: ", useAuthStore.getState());
        const wishItem = await fetchWish();
        useWishItemStore.getState().setItems(wishItem);
        console.log("Wish item: ", useWishItemStore.getState().items);
      }
    };

    checkUser();
  }, [navigate]);

  const handleLaptop = () => {
    navigate("/goods/list", { state: "laptop" });
  };
  const handleKeyboard = () => {
    navigate("/goods/list", { state: "keyboard" });
  };
  const handlePhone = () => {
    navigate("/goods/list", { state: "phone" });
  };
  const handleTablet = () => {
    navigate("/goods/list", { state: "tablet" });
  };

  return (
    <div className="container mx-auto text-first">
      <Header title="LOGO" showBackButton={false} hideSearchButton={false} />

      {/* <main className="font-semibold mb-4 gap-4 flex-1 overflow-y-auto"> */}
      <main className="font-semibold flex flex-col gap-4 mb-4 flex-1 overflow-y-auto">
        <article className="px-4 py-2 text-first">
          <p className="text-center text-[20px] my-3">
            내가 찾는 중고 물품을 찾아보세요.
          </p>
          <div className="flex gap-4">
            {/* 각 카테고리 */}
            <div
              className="w-full h-fit bg-fourth px-2 rounded-lg"
              onClick={handleLaptop}
            >
              <img src={laptop} alt="laptop" className="w-[96px]" />
              <p className="text-center pb-2">노트북</p>
            </div>
            <div
              className="w-full h-fit bg-fourth px-2 rounded-lg"
              onClick={handleKeyboard}
            >
              <img src={keyboard} alt="keyboard" className="w-[96px]" />
              <p className="text-center pb-2">키보드</p>
            </div>
            <div
              className="w-full h-fit bg-fourth px-2 rounded-lg"
              onClick={handlePhone}
            >
              <img src={phone} alt="phone" className="w-[96px]" />
              <p className="text-center pb-2">휴대폰</p>
            </div>
            <div
              className="w-full h-fit bg-fourth px-2 rounded-lg"
              onClick={handleTablet}
            >
              <img src={tablet} alt="tablet" className="w-[96px]" />
              <p className="text-center pb-2">태블릿</p>
            </div>
          </div>
        </article>
        <article>
          <p className="pl-10 text-[20px]">오늘 인기 아이템</p>
          <div className="grid grid-flow grid-cols-2 gap-4 px-3 mt-2">
            <div>
              <img
                src={thumbnail2}
                alt="thumbnail2"
                className="w-[200px] rounded-xl"
              />
              <p>갤북5(S)급 팝니다</p>
            </div>
            <div>
              <img
                src={thumbnail3}
                alt="example"
                className="w-[200px] rounded-xl"
              />
              <p>맥북pro 팔아용</p>
            </div>
            <div>
              <img
                src={thumbnail4}
                alt="example"
                className="w-[200px] rounded-xl"
              />
              <p>갤북4 싸게 팝니다</p>
            </div>
            <div>
              <img
                src={thumbnail5}
                alt="example"
                className="w-[200px] rounded-xl"
              />
              <p>그램 14인치</p>
            </div>
          </div>
        </article>
        <article>
          <p className="pl-10 text-[20px]">방금 등록된 아이템</p>
          <div className="grid grid-flow grid-cols-2 gap-4 px-3 mt-2">
            <div>
              <img
                src={thumbnail}
                alt="example"
                className="w-[200px] rounded-xl"
              />
              <p>갤북5(S)급 팝니다</p>
            </div>
            <div>
              <img
                src={thumbnail2}
                alt="example"
                className="w-[200px] rounded-xl"
              />
              <p>맥북pro 팔아용</p>
            </div>
            <div>
              <img
                src={thumbnail3}
                alt="example"
                className="w-[200px] rounded-xl"
              />
              <p>갤북4 싸게 팝니다</p>
            </div>
            <div>
              <img
                src={thumbnail4}
                alt="example"
                className="w-[200px] rounded-xl"
              />
              <p>그램 14인치치</p>
            </div>
          </div>
        </article>
      </main>

      {/* 하단 네비게이션 바 */}
      <NavigationBar />
    </div>
  );
};

export default MainPage;
