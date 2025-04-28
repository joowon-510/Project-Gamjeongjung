// src/pages/TransactionsPage.tsx
import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import { getGoodsUsers } from "../../api/goods";
import { GoodsItemProps } from "../../components/goods/GoodsItem";

const TransactionsPage: React.FC = () => {
  // 내가 쓴 글 불러와서 -> 거래 상태 status 확인 후 true 면 보여주기
  const [transactionGoods, setTransactionGoods] = useState<GoodsItemProps[]>(
    []
  );
  const [userGoods, setUserGoods] = useState<GoodsItemProps[]>([]);
  useEffect(() => {
    const fetchUserGoods = async () => {
      try {
        const response = await getGoodsUsers();
        if (response) {
          setUserGoods(response);

          // ✅ status가 true인 것만 필터링해서 저장
          const filtered = response.filter(
            (item: any) => item.itemStatus === true
          );
          setTransactionGoods(filtered);
        }
      } catch (error) {
        console.log("유저가 작성한 글 불러오기 실패: ", error);
      }
    };
    fetchUserGoods();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 헤더 */}
      <Header showBackButton={true} title="거래 내역" hideSearchButton={true} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">거래 내역</h1>

          {/* 내용은 비워둠 */}
          <div className="text-center py-10 text-gray-500">
            거래 내역이 없습니다.
          </div>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default TransactionsPage;
