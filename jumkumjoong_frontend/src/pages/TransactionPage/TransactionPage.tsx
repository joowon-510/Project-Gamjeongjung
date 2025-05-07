// src/pages/TransactionsPage.tsx
import React, { useCallback, useEffect, useState } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import { getGoodsUsers } from "../../api/goods";
import GoodsItem, { GoodsItemProps } from "../../components/goods/GoodsItem";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const TransactionsPage: React.FC = () => {
  const [transactionGoods, setTransactionGoods] = useState<GoodsItemProps[]>(
    []
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 상품 데이터 로딩 함수
  const fetchTransactionGoods = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getGoodsUsers();

      if (response) {
        const filteredGoods = response.filter(
          (item: GoodsItemProps) => item.itemStatus === false
        );
        setTransactionGoods(filteredGoods);
      }
    } catch (err) {
      console.log("거래 상품 로딩 오류:", err);
      setError("상품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactionGoods();
  }, [fetchTransactionGoods]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      {/* 헤더 */}
      <Header showBackButton={true} title="거래 내역" />

      {/* 내가 작성한 글 목록 제목 */}
      <div className="px-4 pt-6 bg-white">
        <h1 className="text-2xl font-bold">거래 내역</h1>
      </div>

      {/* 거래 내역 목록 - 안드로이드 네비게이션 바를 고려하여 여백 제거 */}
      <main className="flex-1 overflow-y-auto pb-0">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          // 오류 상태 표시
          <div className="p-4 text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={fetchTransactionGoods}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        ) : transactionGoods.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {[...transactionGoods]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((item) => (
                <GoodsItem key={item.itemId} {...item} />
              ))}
            <li className="h-14 bg-transparent border-none" />
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            거래 상품이 없습니다.
          </div>
        )}
      </main>

      {/* NavigationBar 고정 위치로 배치 */}
      <div className="fixed bottom-0 left-0 w-full">
        <NavigationBar />
      </div>
    </div>
  );
};

export default TransactionsPage;
