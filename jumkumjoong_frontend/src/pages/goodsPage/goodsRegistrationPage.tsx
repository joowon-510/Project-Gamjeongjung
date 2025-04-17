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

const GoodsRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GoodsRegistrationData>({
    title: "",
    description: "",
    price: "",
    images: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 입력 필드 변경 처리
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    if (!formData.title.trim() || !formData.price.trim()) {
      alert("상품명과 가격은 필수 입력 항목입니다.");
      return;
    }

    try {
      setIsLoading(true);

      // 가격에 만원 단위 추가
      const submissionData = {
        ...formData,
        price: `${formData.price}0000`, // 만원 단위를 원 단위로 변환 (예: 67 -> 670000)
      };

      // 상품 등록 API 호출
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

  // 검색 기능은 이 페이지에서 사용하지 않지만 Header를 일관되게 유지하기 위해 더미 함수 제공
  const handleSearch = () => {
    console.log("등록 페이지에서는 검색 기능을 제공하지 않습니다.");
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 통일된 헤더 사용 */}
      <Header
        showBackButton={true}
        title="LOGO"
        hideSearchButton={true} // 검색 버튼 숨김 설정 추가
      />

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="상품 설명을 입력하세요"
            />
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

          {/* 여백 */}
          <div className="h-20"></div>
        </form>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="p-4 bg-white border-t flex space-x-2">
        {/* <div className="fixed bottom-14 left-0 right-0 p-4 bg-white border-t flex space-x-2"> */}
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
