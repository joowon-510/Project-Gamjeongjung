// src/components/goods/GoodsStatus.tsx
import React from "react";

interface GoodsStatusProps {
  status: string[];
}

const GoodsStatus: React.FC<GoodsStatusProps> = ({ status: productInfo }) => {
  console.log("@@@@@@@", productInfo);
  const damagedKeys = productInfo.length > 0 ? productInfo[1].split(";") : [];
  console.log(damagedKeys);
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* 상태 */}
        {productInfo.length > 0 && productInfo[0].length > 0 ? (
          productInfo[0] === "back" ? (
            <div className="">
              <h2 className="text-lg font-bold mb-4">상품 상태</h2>

              <div className="border rounded-lg p-3">
                <h3 className="font-medium border-b pb-2 mb-2">후면</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">스크래치: </span>
                    <span>{damagedKeys.length} 개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">파손:</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="">
              <h2 className="text-lg font-bold mb-4">상품 상태</h2>
              <div className="border rounded-lg p-3">
                <h3 className="font-medium border-b pb-2 mb-2">전면</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">스크래치: </span>
                    <span>{}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">파손:</span>
                    {/* <span>{}개</span> */}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default GoodsStatus;
