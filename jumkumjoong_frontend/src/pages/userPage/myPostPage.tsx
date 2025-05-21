// src/pages/MyPostsPage.tsx
import React, { useEffect, useState } from "react";

import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import GoodsItem, { GoodsItemProps } from "../../components/goods/GoodsItem";

import { getGoodsUsers } from "../../api/goods";

import { sortGoodsByDateDesc } from "../../utils/sortUtils";
import { useLocation, useNavigate } from "react-router-dom";

const MyPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const [myGoods, setMyGoods] = useState<GoodsItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(0);
  const location = useLocation();
  const state = location.state as {
    userName: string;
    userId: number;
  };
  const userInfo = location && location.state ? location.state : undefined;

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getGoodsUsers(state.userId);
      console.log("유저가 만든 게시물: ", response);
      if (response) {
        setMyGoods(response);
      } else {
        setMyGoods([]);
      }
    } catch (error) {
      console.log("내가 등록한 게시글 조회 실패: ", error);
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoBack = () => {
    navigate(-1);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-center text-red-500">
          <p>{error}</p>
        </div>
      );
    }

    if (myGoods.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          작성한 글이 없습니다.
        </div>
      );
    }

    return (
      <ul className="mt-1 divide-y divide-gray-200">
        {sortGoodsByDateDesc(myGoods).map((item) => (
          <GoodsItem
            key={item.itemId}
            {...item}
            canChangeStatus={true} // 옵션 사용 시 주석 해제
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더 */}
      <Header />

      {/* 내가 작성한 글 목록 제목 */}
      <div className="px-4 pt-6 mb-3">
        <h1 className="text-2xl font-bold">{state.userName} 님이 작성한 글</h1>
      </div>

      {/* 내가 작성한 글 목록 */}
      <main className="flex-1 overflow-y-auto pb-[140px]">
        {renderContent()}
      </main>

      {/* 뒤로가기 버튼 */}
      <button
        onClick={onGoBack}
        className="fixed bottom-[110px] left-4 bg-white hover:bg-white rounded-full p-2 shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* NavigationBar 고정 위치로 배치 */}
      <div className="fixed bottom-0 left-0 w-full">
        <NavigationBar />
      </div>
    </div>
  );
};

export default MyPostsPage;
