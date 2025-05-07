// src/pages/goodsPage/goodsRegistrationPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavigationBar from "../../components/common/NavigationBar";
import Header from "../../components/common/Header";
import PriceInput from "../../components/goods/PriceInput";

// Goods 타입 인터페이스 임포트
import { ItemRegistParams } from "../../types/types";
import { postGoods, postGoodsEdit } from "../../api/goods";
import SerialNumberInput from "../../components/goods/SerialNumberInput";

// 구성여부 타입 정의
type PackageType = "full" | "single" | "partial";

interface ExtendedGoodsData extends ItemRegistParams {
  // images: File[];
  purchaseYear: string;
  purchaseMonth: string;
  // purchaseDate: string;
}

const GoodsRegistrationPage: React.FC = () => {
  const location = useLocation();
  // const editItem = location.state as
  //   | (ExtendedGoodsData & { itemId?: string })
  //   | undefined;
  const editItem =
    location.state && "title" in location.state
      ? (location.state as ExtendedGoodsData & { itemId?: string })
      : undefined;

  const navigate = useNavigate();
  // 현재 년도 구하기
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) =>
    (currentYear - i).toString()
  );

  // const [formData, setFormData] = useState<ExtendedGoodsData>({
  //   title: location.state.title,
  //   description: location.state.description,
  //   price: location.state.price, // This is causing the error
  //   // images: [],
  //   purchaseDate: location.state.purchaseDate,
  //   grades: location.state.grades,
  //   status: location.state.status,
  //   configuration: location.state.configuration, // 구성품 0: 풀박 / 1: 일부 / 2: 단품
  //   scratchesStatus: location.state.scratchesStatus,
  //   createdAt: location.state.createdAt,
  //   serialNumber: location.state.serialNumber,

  //   purchaseYear: currentYear.toString(),
  //   purchaseMonth: "0",
  // });

  const [formData, setFormData] = useState<ExtendedGoodsData>(() => {
    if (editItem) {
      return {
        title: editItem.title,
        description: editItem.description,
        price: editItem.price / 10000,
        purchaseDate: editItem.purchaseDate,
        grades: editItem.grades,
        status: editItem.status,
        configuration: editItem.configuration,
        scratchesStatus: editItem.scratchesStatus,
        createdAt: editItem.createdAt,
        serialNumber: editItem.serialNumber,
        purchaseYear:
          editItem.purchaseDate?.split("-")[0] || currentYear.toString(),
        purchaseMonth: editItem.purchaseDate?.split("-")[1] || "0",
      };
    } else {
      return {
        title: "",
        description: "",
        price: 0,
        purchaseDate: "",
        grades: true,
        status: true,
        configuration: 0,
        scratchesStatus: "",
        createdAt: "",
        serialNumber: "",
        purchaseYear: currentYear.toString(),
        purchaseMonth: "0",
      };
    }
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
  const handlePriceChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      price: value,
    }));
  };

  // 시리얼 번호호 입력 처리
  const handleSerialNumberChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      serialNumber: value,
    }));
  };

  // 구성여부 변경 처리
  const handlePackageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as PackageType;

    const configValueMap: Record<PackageType, number> = {
      full: 0,
      partial: 1,
      single: 2,
    };

    setFormData((prev) => ({
      ...prev,
      configuration: configValueMap[selected], // ✅ 숫자로 저장
      packageType: selected, // 표시용으로 유지
    }));
  };

  // 이미지 선택 처리
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     // 파일 배열로 변환
  //     const fileArray = Array.from(e.target.files);
  //     setFormData((prev) => ({
  //       ...prev,
  //       images: fileArray,
  //     }));
  //   }
  // };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (
      !formData.title.trim() ||
      formData.price <= 0 ||
      // !formData.price.trim() ||
      !formData.purchaseYear ||
      formData.serialNumber.trim().length === 0
    ) {
      alert("상품명, 가격, 구매 년도, 시리얼 번호는 필수 입력 항목입니다.");
      return;
    }

    try {
      setIsLoading(true);
      // ⬇️ purchaseDate YYYY-MM 포맷
      const purchaseDateString =
        formData.purchaseMonth === "0"
          ? formData.purchaseYear
          : `${formData.purchaseYear}-${formData.purchaseMonth.padStart(
              2,
              "0"
            )}`;

      let finalDescription = formData.description;
      if (
        formData.configuration === 1 &&
        !finalDescription.includes("구성품:")
      ) {
        finalDescription = `[구성품 안내가 필요합니다. 어떤 구성품이 포함되어 있는지 작성해주세요.]\n\n${finalDescription}`;
      }

      // 구매일자 및 구성여부 정보 추가
      const packageTypeText = {
        full: "풀박스",
        single: "단품",
        partial: "일부구성품",
      }[formData.configuration];

      console.log("formData.serialNumber:", formData.serialNumber);

      // 최종 설명에 구매일자와 구성여부 정보 포함
      finalDescription = `구매일자: ${purchaseDateString}\n구성여부: ${packageTypeText}\n\n${finalDescription}`;
      const date = new Date().toISOString();
      console.log(date);
      // const now = new Date();
      // const kstOffset = 9 * 60 * 60 * 1000; // 9시간(한국 시차)을 밀리초로 변환
      // const kstDate = new Date(now.getTime() + kstOffset);

      // const date = kstDate.toISOString().replace("Z", "+09:00");
      // console.log(date); // 예: 2025-04-25T20:45:00+09:00
      // 상품 등록 API 호출
      const submissionData = {
        ...formData,
        description: finalDescription,
        price: formData.price * 10000, // 만원 단위를 원 단위로 변환 (예: 67 -> 670000)
        purchaseDate: purchaseDateString,
        createdAt: date.toString(),
        serialNumber: formData.serialNumber,
      };
      console.log("submission: ", submissionData);
      if (editItem && editItem.itemId) {
        // TODO: 수정 API 호출 (예: await putGoods(itemId, submissionData))

        try {
          const goodsId = parseInt(editItem.itemId);
          console.log("submissionData: ", {
            ...submissionData,
            itemId: goodsId,
          });
          const response = await postGoodsEdit({
            ...submissionData,
            itemId: goodsId,
          });
          alert("상품 수정이 완료되었습니다.");
          console.log("response: ", response);
          navigate(`/goods/detail/${editItem.itemId}`);
        } catch (error) {
          console.log("상품 상세 수정 실패 : ", error);
        }
      } else {
        // await postGoods(submissionData);
        // const response = await registerGoods(submissionData);
        const response = await postGoods(submissionData);

        console.log("등록된 상품 정보:", response);

        // if (response.data)
        // 성공 시 상품 목록 페이지로 이동
        alert("상품이 등록되었습니다.");
        navigate("/goods/list");
      }
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
    <div className="container h-screen mx-auto text-first">
      {/* 통일된 헤더 사용 */}
      <Header showBackButton={true} title="LOGO" hideSearchButton={true} />

      {/* 폼 영역 - 스크롤 문제 해결을 위해 여백 증가 */}
      <div className="font-semibold mb-4 flex-1 overflow-y-auto">
        {/* <div className="font-semibold flex-1 overflow-y-auto pb-36"> */}
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
          <div className="flex  flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              구매일자
            </label>
            <div className="flex space-x-2">
              {/* 년도 선택 드롭다운 */}
              <div className="w-1/2">
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
              <div className="w-1/2">
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

          {/* 시리얼 넘버 입력 */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              시리얼 넘버
            </label>
            {/* <PriceInput
              id="price"
              name="price"
              value={formData.price}
              onChange={handlePriceChange}
            /> */}
            <SerialNumberInput
              // type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleSerialNumberChange}
            />
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
              value={formData.configuration}
              onChange={handlePackageTypeChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="full">풀박스</option>
              <option value="single">단품</option>
              <option value="partial">일부구성품</option>
            </select>
            {formData.configuration === 1 && (
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
                formData.configuration === 1
                  ? "상품 설명을 입력하세요. 어떤 구성품이 포함되어 있는지 자세히 작성해주세요."
                  : "상품 설명을 입력하세요."
              }
            />
          </div>

          {/* 사진 첨부 */}
          {/* <div>
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
          </div> */}

          {/* 선택된 이미지 미리보기 */}
          {/* {formData.images.length > 0 && (
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
          )} */}
        </div>
      </div>

      {/* 하단 버튼 영역 - sticky로 변경하여 스크롤과 무관하게 항상 표시 */}
      <div className="flex-1 px-3 py-7 bg-white flex gap-2 grid grid-cols-6">
        {/* <div className="sticky bottom-14 left-0 right-0 p-4 bg-white border-t flex space-x-2 z-10"> */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="col-span-2 flex-1 py-3 bg-first/60 text-white font-medium rounded-md"
        >
          취소하기
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="col-span-4 flex-1 py-3 bg-second text-white font-medium rounded-md"
        >
          {/* {isLoading ? "등록 중..." : "등록하기"} */}
          {editItem ? "수정하기" : isLoading ? "등록 중..." : "등록하기"}
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
