// src/pages/goodsPage/goodsRegistrationPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../components/common/NavigationBar";
import Header from "../../components/common/Header";
import PriceInput from "../../components/goods/PriceInput";
import {
  registerGoods,
  GoodsRegistrationData,
} from "../../services/goodsService";

// 구성여부 타입 정의
type PackageType = "full" | "single" | "partial";

interface ExtendedGoodsData extends GoodsRegistrationData {
  purchaseYear: string;
  purchaseMonth: string;
  packageType: PackageType;
}

const GoodsRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  // 현재 년도 구하기
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) =>
    (currentYear - i).toString()
  );

  const [formData, setFormData] = useState<ExtendedGoodsData>({
    title: "",
    description: "",
    price: "",
    images: [],
    purchaseYear: currentYear.toString(), // 기본값으로 현재 년도 설정
    purchaseMonth: "0", // 기본값으로 '기억 안남' 설정
    packageType: "full",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 입력 필드 변경 처리
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 가격 입력 처리
  const handlePriceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      price: value,
    }));
  };

  // 구성여부 변경 처리
  const handlePackageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as PackageType;
    setFormData((prev) => ({
      ...prev,
      packageType: value,
    }));
  };

  // 이미지 선택 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // 파일 배열로 변환
      const fileArray = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: fileArray,
      }));
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (
      !formData.title.trim() ||
      !formData.price.trim() ||
      !formData.purchaseYear
    ) {
      alert("상품명, 가격, 구매 년도는 필수 입력 항목입니다.");
      return;
    }

    try {
      setIsLoading(true);

      // 구매일자 문자열 생성
      let purchaseDateString = `${formData.purchaseYear}년`;
      if (formData.purchaseMonth !== "0") {
        purchaseDateString += ` ${formData.purchaseMonth}월`;
      }

      // 구성여부가 일부인 경우 설명에 안내 메시지 추가
      let finalDescription = formData.description;
      if (
        formData.packageType === "partial" &&
        !finalDescription.includes("구성품:")
      ) {
        finalDescription = `[구성품 안내가 필요합니다. 어떤 구성품이 포함되어 있는지 작성해주세요.]\n\n${finalDescription}`;
      }

      // 구매일자 및 구성여부 정보 추가
      const packageTypeText = {
        full: "풀박스",
        single: "단품",
        partial: "일부구성품",
      }[formData.packageType];

      // 최종 설명에 구매일자와 구성여부 정보 포함
      finalDescription = `구매일자: ${purchaseDateString}\n구성여부: ${packageTypeText}\n\n${finalDescription}`;

      // 상품 등록 API 호출
      const submissionData = {
        ...formData,
        description: finalDescription,
        price: `${formData.price}0000`, // 만원 단위를 원 단위로 변환 (예: 67 -> 670000)
      };

      const response = await registerGoods(submissionData);

      console.log("등록된 상품 정보:", response);

      // 성공 시 상품 목록 페이지로 이동
      alert("상품이 등록되었습니다.");
      navigate("/goods/list");
    } catch (error) {
      console.error("상품 등록 오류:", error);
      alert("상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 통일된 헤더 사용 */}
      <Header showBackButton={true} title="LOGO" hideSearchButton={true} />

      {/* 폼 영역 - 스크롤 문제 해결을 위해 여백 증가 */}
      <div className="flex-1 overflow-y-auto pb-36">
        <div className="p-4 space-y-6">
          {/* 상품명 입력 */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              상품명
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="상품명을 입력하세요"
            />
          </div>

          {/* 구매일자 입력 - 드롭다운으로 변경 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              구매일자
            </label>
            <div className="flex space-x-2">
              {/* 년도 선택 드롭다운 */}
              <div className="w-3/5">
                <select
                  id="purchaseYear"
                  name="purchaseYear"
                  value={formData.purchaseYear}
                  onChange={handleInputChange}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    년도 선택
                  </option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
              </div>

              {/* 월 선택 드롭다운 */}
              <div className="w-2/5">
                <select
                  id="purchaseMonth"
                  name="purchaseMonth"
                  value={formData.purchaseMonth}
                  onChange={handleInputChange}
                  className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="0">기억 안남</option>
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(
                    (month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 구성여부 선택 */}
          <div>
            <label
              htmlFor="packageType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              구성여부
            </label>
            <select
              id="packageType"
              name="packageType"
              value={formData.packageType}
              onChange={handlePackageTypeChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="full">풀박스</option>
              <option value="single">단품</option>
              <option value="partial">일부구성품</option>
            </select>
            {formData.packageType === "partial" && (
              <p className="mt-1 text-sm text-red-500">
                일부구성품을 선택하신 경우, 상품설명에 포함된 구성품을 자세히
                적어주세요.
              </p>
            )}
          </div>

          {/* 가격 입력 (만원 단위) */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              가격
            </label>
            <PriceInput
              id="price"
              name="price"
              value={formData.price}
              onChange={handlePriceChange}
            />
          </div>

          {/* 상품 설명 입력 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              상품설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                formData.packageType === "partial"
                  ? "상품 설명을 입력하세요. 어떤 구성품이 포함되어 있는지 자세히 작성해주세요."
                  : "상품 설명을 입력하세요."
              }
            />
          </div>

          {/* 사진 첨부 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사진 첨부
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="images"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer text-sm"
              >
                찾아보기
              </label>
              <span className="ml-2 text-sm text-gray-500">
                {formData.images.length > 0
                  ? `${formData.images.length}개의 이미지 선택됨`
                  : "이미지를 선택하세요"}
              </span>
            </div>
          </div>

          {/* 선택된 이미지 미리보기 */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Array.from(formData.images).map((image, index) => (
                <div key={index} className="relative h-24">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="h-full w-full object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 영역 - sticky로 변경하여 스크롤과 무관하게 항상 표시 */}
      <div className="sticky bottom-14 left-0 right-0 p-4 bg-white border-t flex space-x-2 z-10">
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
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-3 bg-second text-white font-medium rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          {isLoading ? "등록 중..." : "등록하기"}
        </button>
      </div>

      {/* 하단 네비게이션 바 */}
      {/* <div className="fixed bottom-0 left-0 right-0 z-10"> */}
      <NavigationBar />
      {/* </div> */}
    </div>
  );
};

export default GoodsRegistrationPage;
