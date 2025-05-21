// src/components/goods/GoodsStatus.tsx
import React from "react";

interface GoodsStatusProps {
  status: string[];
}

const GoodsStatus: React.FC<GoodsStatusProps> = ({ status }) => {
  if (status.length < 2) return null;

  const locationStr = status[0]; // ex: "keyboard|back|side"
  const damageStr = status[1]; // ex: "img1.jpg>Damage1;Damage2|img2.jpg>Damage3;..."

  const locations = locationStr.split("|"); // ["keyboard", "back", "side"]
  const damageData = damageStr.split("|"); // ["img1.jpg>Damage1;Damage2", ...]

  // 각 위치별 총 손상 개수를 저장할 객체
  const locationDamageCounts: { [location: string]: number } = {};

  // damageData 순회하며 위치별 파손 개수 카운트

  damageData.forEach((entry, index) => {
    const [imgName, damageList] = entry.split(">");
    if (!damageList) return;

    const location = locations[index]; // 이미지 순서에 따른 위치 결정
    if (!location) return; // 방어코드

    // 세미콜론으로 구분된 손상 항목들을 분리하여 개수 세기
    const damages = damageList.split(";").filter((item) => item.trim());
    // 해당 위치의 총 손상 개수 증가
    locationDamageCounts[location] =
      (locationDamageCounts[location] || 0) + damages.length;
  });

  // 위치명 한글로 변환하는 함수
  const getLocationName = (location: string): string => {
    switch (location.toLowerCase()) {
      case "back":
        return "후면";
      case "front":
        return "전면";
      case "screen":
        return "화면";
      case "side":
        return "측면";
      case "keyboard":
        return "키보드";
      default:
        return "그 외";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">상품 상태</h2>
      <div className="grid grid-cols-1 grid-cols-2 gap-4 text-sm">
        {locations.map((location, index) => (
          <div key={location} className="border rounded-lg p-3 shadow-sm">
            <h3 className="font-medium border-b pb-2 mb-2 ">
              {getLocationName(location)}
            </h3>
            <div className="flex justify-between">
              <span className="text-gray-600">파손 여부</span>
              <span>
                {locationDamageCounts[location] > 0
                  ? `${locationDamageCounts[location]} 개`
                  : "없음"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoodsStatus;
