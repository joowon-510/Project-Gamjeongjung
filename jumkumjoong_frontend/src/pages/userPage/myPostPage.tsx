// src/pages/MyPostsPage.tsx
import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import GoodsItem, { GoodsItemProps } from "../../components/goods/GoodsItem";
import { getGoodsUsers } from "../../api/goods";

const MyPostsPage: React.FC = () => {
  // 사용자 ID (하드코딩)
  // const myUserId = 1;
  const [myGoods, setMyGoods] = useState<GoodsItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getGoodsUsers();
      console.log("유저가 만든 게시물: ", response);
      if (response) {
        setMyGoods(response);
      }
    } catch (error) {
      console.log("내가 등록한 게시글 조회 실패: ", error);
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
      setMyGoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* 헤더 */}
      <Header />

      {/* 내가 작성한 글 목록 제목 */}
      <div className="px-4 pt-6 bg-white">
        <h1 className="text-2xl font-bold">내가 작성한 글</h1>
      </div>

      {/* 내가 작성한 글 목록 */}
      <main className="flex-1 overflow-y-auto pb-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : myGoods.length > 0 ? (
          <ul className="mt-1 divide-y divide-gray-200">
            {myGoods
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((item) => (
                <GoodsItem
                  key={item.itemId}
                  itemId={item.itemId}
                  itemName={item.itemName}
                  itemPrice={item.itemPrice}
                  createdAt={item.createdAt}
                  itemStatus={item.itemStatus}
                  imageUrl={item.imageUrl}
                  // canChangeStatus={true} // ✅ 거래 상태 변경 가능
                />
              ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            작성한 글이 없습니다.
          </div>
        )}
      </main>

      {/* 여백 추가 */}
      <div className="h-16"></div>

      {/* NavigationBar 고정 위치로 배치 */}
      <div className="fixed bottom-0 left-0 w-full">
        <NavigationBar />
      </div>
    </div>
  );
};

export default MyPostsPage;
