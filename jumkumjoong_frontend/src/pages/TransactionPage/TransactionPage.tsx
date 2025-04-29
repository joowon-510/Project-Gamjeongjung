// src/pages/TransactionsPage.tsx
import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import { getGoodsUsers } from "../../api/goods";
import GoodsItem, { GoodsItemProps } from "../../components/goods/GoodsItem";

const TransactionsPage: React.FC = () => {
  // 내가 쓴 글 불러와서 -> 거래 상태 status 확인 후 true 면 보여주기
  const [transactionGoods, setTransactionGoods] = useState<GoodsItemProps[]>(
    []
  );
  const [userGoods, setUserGoods] = useState<GoodsItemProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 상품 데이터 로딩 함수
  const loadGoods = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // const data = await getGoodsUsers();
      // console.log("data: ", data);
    } catch (err) {
      console.log("상품 로딩 오류:", err);
      setError("상품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserGoods = async () => {
      try {
        setIsLoading(true); // ✅ 시작할 때 로딩 true
        const response = await getGoodsUsers();
        if (response) {
          setUserGoods(response);

          // ✅ status가 false인 것만 필터링해서 저장
          const filtered = response.filter(
            (item: any) => item.itemStatus === false
          );
          console.log("filtered: ", filtered);
          setTransactionGoods(filtered);
        }
      } catch (error) {
        console.log("유저가 작성한 글 불러오기 실패: ", error);
        setError("상품을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false); // ✅ 무조건 마지막에 로딩 false
      }
    };
    fetchUserGoods();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      {/* 헤더 */}
      <Header showBackButton={true} title="거래 내역" hideSearchButton={true} />

      {/* 내가 작성한 글 목록 제목 */}
      <div className="px-4 pt-6 bg-white">
        <h1 className="text-2xl font-bold">거래 내역</h1>
      </div>

      {/* 거래 내역 목록 - 안드로이드 네비게이션 바를 고려하여 여백 제거 */}
      <main className="flex-1 overflow-y-auto pb-0">
        {isLoading ? (
          // 로딩 상태 표시
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          // 오류 상태 표시
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={() => loadGoods()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        ) : (
          // 거래 내역 목록 표시 - 마지막 아이템에 패딩 추가하여 하단 네비게이션 바와 겹치지 않게 함

          <ul className="divide-y divide-gray-200">
            {transactionGoods.length > 0 ? (
              [...transactionGoods]
                // goods
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((item, index) => (
                  // goods.map((item, index) => (
                  <GoodsItem key={item.itemId} {...item} />
                ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                "거래 상품이 없습니다."
              </li>
            )}
            {/* 네비게이션 바 높이만큼의 여백 추가 */}
            <li className="h-14 bg-transparent border-none"></li>
          </ul>
        )}
      </main>

      {/* <NavigationBar /> */}
      {/* NavigationBar 고정 위치로 배치 */}
      <div className="fixed bottom-0 left-0 w-full">
        <NavigationBar />
      </div>
    </div>
  );
};

export default TransactionsPage;
