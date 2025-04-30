// src/pages/ReviewPage/ReviewRegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../components/common/NavigationBar";
import Header from "../../components/common/Header";
import starFilled from "../../assets/icons/starFilled.svg";
import starEmpty from "../../assets/icons/starEmpty.svg";
import starHalf from "../../assets/icons/starHalf.svg";
// import PriceInput from "../../components/goods/PriceInput";

// Goods 타입 인터페이스 임포트
// import { ItemRegistParams } from "../../types/types";
// import { postGoods } from "../../api/goods";
// import SerialNumberInput from "../../components/goods/SerialNumberInput";

// 구성여부 타입 정의
// type PackageType = "full" | "single" | "partial";

export interface ReviewItemProps {
  star: number;
  review: string;
  createdAt: string;
}

const ReviewRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // 하드코딩
  const userName = "박수연.";

  const [formData, setFormData] = useState<ReviewItemProps>({
    star: 0,
    review: "",
    createdAt: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 입력 필드 변경 처리
  // const handleInputChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  //   >
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // 가격 입력 처리
  // const handlePriceChange = (value: number) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     price: value,
  //   }));
  // };

  // 폼 제출 처리
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // 필수 필드 검증
  //   if (
  //     !formData.title.trim() ||
  //     formData.price <= 0 ||
  //     // !formData.price.trim() ||
  //     !formData.purchaseYear ||
  //     formData.serialNumber.trim().length === 0
  //   ) {
  //     alert("상품명, 가격, 구매 년도, 시리얼 번호는 필수 입력 항목입니다.");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     // ⬇️ purchaseDate YYYY-MM 포맷
  //     const purchaseDateString =
  //       formData.purchaseMonth === "0"
  //         ? formData.purchaseYear
  //         : `${formData.purchaseYear}-${formData.purchaseMonth.padStart(
  //             2,
  //             "0"
  //           )}`;

  //     let finalDescription = formData.description;
  //     if (
  //       formData.configuration === 1 &&
  //       !finalDescription.includes("구성품:")
  //     ) {
  //       finalDescription = `[구성품 안내가 필요합니다. 어떤 구성품이 포함되어 있는지 작성해주세요.]\n\n${finalDescription}`;
  //     }

  //     // 구매일자 및 구성여부 정보 추가
  //     const packageTypeText = {
  //       full: "풀박스",
  //       single: "단품",
  //       partial: "일부구성품",
  //     }[formData.configuration];

  //     console.log("formData.serialNumber:", formData.serialNumber);

  //     // 최종 설명에 구매일자와 구성여부 정보 포함
  //     finalDescription = `구매일자: ${purchaseDateString}\n구성여부: ${packageTypeText}\n\n${finalDescription}`;
  //     const date = new Date().toISOString();
  //     console.log(date);
  //     // const now = new Date();
  //     // const kstOffset = 9 * 60 * 60 * 1000; // 9시간(한국 시차)을 밀리초로 변환
  //     // const kstDate = new Date(now.getTime() + kstOffset);

  //     // const date = kstDate.toISOString().replace("Z", "+09:00");
  //     // console.log(date); // 예: 2025-04-25T20:45:00+09:00
  //     // 상품 등록 API 호출
  //     const submissionData = {
  //       ...formData,
  //       description: finalDescription,
  //       price: formData.price * 10000, // 만원 단위를 원 단위로 변환 (예: 67 -> 670000)
  //       purchaseDate: purchaseDateString,
  //       createdAt: date.toString(),
  //       serialNumber: formData.serialNumber,
  //     };
  //     console.log("submission: ", submissionData);

  //     // const response = await registerGoods(submissionData);
  //     const response = await postGoods(submissionData);

  //     console.log("등록된 상품 정보:", response);

  //     // 성공 시 상품 목록 페이지로 이동
  //     alert("상품이 등록되었습니다.");
  //     navigate("/goods/list");
  //   } catch (error) {
  //     console.error("상품 등록 오류:", error);
  //     alert("상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // 취소 처리
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="container h-screen mx-auto text-first">
      {/* 통일된 헤더 사용 */}
      <Header showBackButton={true} title="LOGO" hideSearchButton={true} />
      {/* 리뷰작성 제목 */}
      <div className="px-4 pt-4 bg-white">
        <h1 className="text-2xl font-bold">리뷰 작성</h1>
      </div>
      {/* 폼 영역 - 스크롤 문제 해결을 위해 여백 증가 */}
      <div className="font-semibold mb-4 flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* 신뢰도 입력 */}
          <div>
            <label
              htmlFor="title"
              className="block text-md font-medium text-gray-700 mb-1"
            >
              {userName} 님의 물건은 어땠나요?
            </label>
            <label
              htmlFor="title"
              className="block text-md font-medium text-gray-700 mb-1"
            >
              신뢰도를 입력해주세요.
            </label>
            <div className="flex justify-between items-center w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <div className="text-lg ml-4">{formData.star} 점</div>
              <div className="flex mr-4">
                {/* {[1, 2, 3, 4, 5].map((index) => (
                  <img
                    key={index}
                    src={formData.star >= index ? starFilled : starEmpty} // ⭐️
                    alt={`star-${index}`}
                    className="w-10 h-10 cursor-pointer"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        star: index, // ⭐️ 클릭한 별 인덱스 저장
                      }))
                    }
                  />
                ))} */}
                {[1, 2, 3, 4, 5].map((value) => {
                  const half = value - 0.5;
                  return (
                    <div key={value} className="relative w-10 h-10">
                      {/* 왼쪽 반 클릭 (0.5점) */}
                      <div
                        className="absolute w-1/2 h-full left-0 top-0 cursor-pointer z-10"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, star: half }))
                        }
                      />
                      {/* 오른쪽 반 클릭 (1점) */}
                      <div
                        className="absolute w-1/2 h-full right-0 top-0 cursor-pointer z-10"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, star: value }))
                        }
                      />
                      {/* 아이콘 렌더링 */}
                      <img
                        src={
                          formData.star >= value
                            ? starFilled
                            : formData.star >= half
                            ? starHalf
                            : starEmpty
                        }
                        alt={`star-${value}`}
                        className="w-10 h-10"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 리뷰 입력 */}
          <div>
            <label
              htmlFor="description"
              className="block text-md font-medium text-gray-700 mb-1"
            >
              리뷰를 남겨주세요.
            </label>
            <textarea
              id="review"
              name="review"
              rows={6}
              value={formData.review}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  review: e.target.value, // ✅ 변경사항 바로 반영
                }))
              }
              className="w-full h-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                formData.review.trim().length === 0
                  ? "리뷰를 입력하세요. \n리뷰는 100자 이상 작성해주세요."
                  : "리뷰를 입력하세요."
              }
            />
            <p className="text-end mr-1 text-first/70">
              {formData.review.trim().length}/100
            </p>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 - sticky로 변경하여 스크롤과 무관하게 항상 표시 */}
      <div className="flex-1 px-3 py-7 bg-white flex gap-2 ">
        {/* <div className="sticky bottom-14 left-0 right-0 p-4 bg-white border-t flex space-x-2 z-10"> */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 py-3 bg-fifth text-white font-medium rounded-md hover:bg-red-600 disabled:bg-red-300"
        >
          취소하기
        </button>
        <button
          type="button"
          // onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-3 bg-second text-white font-medium rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          {isLoading ? "등록 중..." : "등록하기"}
        </button>
      </div>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <NavigationBar />
      </div>
    </div>
  );
};

export default ReviewRegisterPage;
