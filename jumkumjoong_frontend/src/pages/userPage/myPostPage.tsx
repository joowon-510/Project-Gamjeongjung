// src/pages/MyPostsPage.tsx
import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import GoodsItem, { GoodsItemProps } from "../../components/goods/GoodsItem";
import { getGoodsUsers } from "../../api/goods";

const MyPostsPage: React.FC = () => {
  // 사용자 ID (하드코딩)
  const myUserId = 1;
  const [allGoods, setAllGoods] = useState<GoodsItemProps[]>([]);

  // 목업 데이터 - 실제 구현에서는 API 호출이나 상태 관리를 통해 가져와야 함
  // const allGoods = [
  //   {
  //     id: 101,
  //     title: "갤럭5(S급) 팝니다",
  //     price: 9600000,
  //     time: "2시간전",
  //     seller: "재드래곤",
  //     imageUrl: "/path/to/galaxy5.jpg",
  //     userId: 1, // 내가 작성한 글
  //   },
  //   {
  //     id: 102,
  //     title: "아이폰 14 Pro Max 팝니다",
  //     price: 9600000,
  //     time: "3시간전",
  //     seller: "재드래곤",
  //     imageUrl: "/path/to/iphone.jpg",
  //     userId: 1, // 내가 작성한 글
  //   },
  //   {
  //     id: 103,
  //     title: "맥북pro 팔아용",
  //     price: 9600000,
  //     time: "16시간전",
  //     seller: "AI의신예훈",
  //     imageUrl: "/path/to/macbook.jpg",
  //     userId: 2, // 다른 사용자의 글
  //   },
  // ];

  useEffect(() => {
    const fetchMyGoods = async () => {
      try {
        const response = await getGoodsUsers();
        console.log("유저가 만든 게시물: ", response);
        if (response) {
          setAllGoods(response);
        }
      } catch (error) {
        console.log("내가 등록한 게시글 조회 실패: ", error);
      }
    };
    fetchMyGoods();
  }, []);

  // 내가 작성한 글만 필터링
  // const myPosts = allGoods.filter((item) => item.userId === myUserId);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* 헤더 */}
      <Header />

      {/* 내가 작성한 글 목록 제목 */}
      <div className="px-4 pt-6 bg-white">
        <h1 className="text-2xl font-bold">내가 작성한 글</h1>
      </div>

      {/* 내가 작성한 글 목록 */}
      {allGoods.length > 0 ? (
        <ul className="mt-1 divide-y divide-gray-200">
          {/* {allGoods.map((item) => ( */}
          {[...allGoods]
            // goods
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((item, index) => (
              <GoodsItem
                // type="post"
                key={item.itemId}
                itemId={item.itemId}
                itemName={item.itemName}
                itemPrice={item.itemPrice}
                createdAt={item.createdAt}
                // seller={item.seller}
                itemStatus={item.itemStatus}
                imageUrl={item.imageUrl}
                canChangeStatus={true} // ✅ 거래 상태 변경 가능
              />
            ))}
        </ul>
      ) : (
        <div className="p-8 text-center text-gray-500">
          작성한 글이 없습니다.
        </div>
      )}

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
