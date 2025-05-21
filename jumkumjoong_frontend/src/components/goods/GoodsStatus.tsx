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

  // 각 위치별 damage count 맵
  const locationDamageMap: {
    [location: string]: {
      [damageType: string]: number;
    };
  } = {};

  // 가능한 파손 타입들
  const DAMAGE_TYPES = [
    "Damaged Keys",
    "Scratch",
    "Display Issues",
    "Damaged Screen",
  ];

  // damageData 순회하며 위치별 파손 개수 카운트

  damageData.forEach((entry, index) => {
    const [imgName, damageList] = entry.split(">");
    if (!damageList) return;

    const location = locations[index]; // 이미지 순서에 따른 위치 결정
    if (!location) return; // 방어코드

    if (!locationDamageMap[location]) {
      locationDamageMap[location] = {};
    }

    DAMAGE_TYPES.forEach((type) => {
      const regex = new RegExp(`${type}`, "gi");
      const matches = damageList.match(regex);
      const count = matches ? matches.length : 0;
      locationDamageMap[location][type] =
        (locationDamageMap[location][type] || 0) + count;
    });
  });

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">상품 상태</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        {Object.entries(locationDamageMap).map(([location, damages]) => (
          <div
            key={location}
            className="border rounded-lg p-3 bg-white shadow-sm"
          >
            <h3 className="font-medium border-b pb-2 mb-2 capitalize">
              {location === "back"
                ? "후면"
                : location === "front"
                ? "전면"
                : location === "screen"
                ? "화면"
                : location === "side"
                ? "측면"
                : location === "keyboard"
                ? "키보드"
                : "그 외"}
            </h3>
            {Object.entries(damages).map(([type, count]) => (
              <div className="flex justify-between" key={type}>
                <span className="text-gray-600">{type}</span>
                <span>{count}개</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoodsStatus;
