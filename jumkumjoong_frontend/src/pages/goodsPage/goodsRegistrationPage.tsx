// src/pages/goodsPage/goodsRegistrationPage.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavigationBar from "../../components/common/NavigationBar";
import Header from "../../components/common/Header";
import PriceInput from "../../components/goods/PriceInput";
import CameraModal from "../../components/goods/CameraModal";

// Goods 타입 인터페이스 임포트
import { ItemRegistParams } from "../../types/types";
import { postGoods, postGoodsEdit, postGoodsImage } from "../../api/goods";
import SerialNumberInput from "../../components/goods/SerialNumberInput";

// 이미지 처리를 위한 API 함수 import
import fastapiInstance from "../../api/fastapi"; // 기존 axios 인스턴스 활용
import { useAuthStore } from "../../stores/useUserStore";

// 구성여부 타입 정의
type PackageType = "full" | "single" | "partial";

interface ExtendedGoodsData extends ItemRegistParams {
  purchaseYear: string;
  purchaseMonth: string;
}

interface ImageData {
  images: File[]; // base64 형식의 이미지 문자열 배열
  imageUrls?: string[]; // 서버에서 반환받은 이미지 URL 배열
}

// fastapi로 이미지 전송, 결과 받아오는 코드
// base64 문자열을 Blob 형식으로 변환하는 헬퍼 함수
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// fastapi 서버에서 멀티파트로 받은 데이터를 분리하는 함수
async function parseMultipartBlob(blob: Blob): Promise<{
  jsonData: any;
  imageMap: { [key: string]: Blob };
}> {
  const text = await blob.text();

  const boundaryMatch = text.match(/^--(.+?)\r\n/);
  if (!boundaryMatch) throw new Error("boundary not found");
  const boundary = boundaryMatch[1];

  const parts = text
    .split(`--${boundary}`)
    .filter((p) => p.trim() && p.trim() !== "--");

  const imageMap: { [key: string]: Blob } = {};
  let jsonData: any = null;

  for (let part of parts) {
    const headerBodySplit = part.split("\r\n\r\n");
    if (headerBodySplit.length < 2) continue;

    const header = headerBodySplit[0];
    const body = headerBodySplit.slice(1).join("\r\n\r\n").trimEnd();

    const nameMatch = header.match(/name="(.+?)"/);
    const filenameMatch = header.match(/filename="(.+?)"/);
    const contentTypeMatch = header.match(/Content-Type: (.+)/);

    const name = nameMatch?.[1];
    const contentType = contentTypeMatch?.[1];

    if (contentType?.includes("application/json")) {
      jsonData = JSON.parse(body);
    } else if (filenameMatch) {
      // 바이너리 Blob 생성
      const raw = new TextEncoder().encode(body);
      const blob = new Blob([raw], {
        type: contentType || "application/octet-stream",
      });
      imageMap[filenameMatch[1]] = blob; // 바이너리
    }
  }

  return { jsonData, imageMap };
}

// 이미지를 서버에 업로드하고 이미지 URL 배열을 반환하는 함수
export async function uploadProductAndImages(
  images: File[],
  productInfo: { name: any; price: any; description: any }
) {
  const formDataNew = new FormData();
  images.forEach((img) => formDataNew.append("images", img));
  formDataNew.append("product_name", productInfo.name);
  formDataNew.append("price", productInfo.price);
  formDataNew.append("description", "description_information");

  const response = await fastapiInstance.post("/upload-info", formDataNew, {
    responseType: "blob", // binary로 받기
    headers: { "Content-Type": "multipart/form-data" },
  });

  const { jsonData, imageMap } = await parseMultipartBlob(response.data);
  console.log("json 데이터 : ", jsonData);
  console.log("image 데이터 : ", imageMap);
  return { jsonData, imageMap };
}

// 프론트엔드에 추가할 함수 - 기존 uploadImagesToServer 함수 아래에 추가
const generateSalesContent = async (
  images: File[],
  productInfo: {
    name: string;
    price: string;
    serialNumber: string;
    purchaseDate: string;
    configuration: number;
  }
): Promise<{ title: string; description: string; imageUrls: string[] }> => {
  if (images.length === 0) {
    throw new Error("이미지를 최소 1장 이상 촬영해주세요.");
  }

  try {
    const formDataNew = new FormData();

    // 이미지 추가
    images.forEach((file, index) => {
      formDataNew.append("images", file);
    });

    // 제품 정보 추가
    formDataNew.append("product_name", productInfo.name);
    formDataNew.append("price", productInfo.price);
    formDataNew.append("serial_number", productInfo.serialNumber);
    formDataNew.append("purchase_date", productInfo.purchaseDate);
    formDataNew.append("configuration", productInfo.configuration.toString());

    formDataNew.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // 판매글 생성 API 호출
    const response = await fastapiInstance.post(
      "/generate-description",
      formDataNew
    );

    console.log("✅ 판매글 생성 요청 성공");
    console.log("🔄 response 객체:", response);
    console.log("🟢 response.data:", response.data);

    return {
      title: response.data.title,
      description: response.data.description,
      imageUrls: response.data.image_urls || [],
    };
  } catch (error) {
    console.error("판매글 생성 실패:", error);
    throw new Error("판매글 생성에 실패했습니다.");
  }
};

// fastapi로 이미지 전송, 결과 받아오는 코드 끝

const GoodsRegistrationPage: React.FC = () => {
  const location = useLocation();

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

  const [formData, setFormData] = useState<ExtendedGoodsData>(() => {
    if (editItem) {
      return {
        title: editItem.title,
        description: editItem.description,
        price: editItem.price,
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

  const [imageData, setImageData] = useState<ImageData>(() => {
    if (editItem) {
      return {
        images: [] as File[], // 빈 이미지 배열로 초기화
        // imageUrls: editItem.imageUrls || [], // 기존 이미지 URL이 있으면 사용
      };
    } else {
      return {
        images: [] as File[], // 빈 이미지 배열로 초기화
      };
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);

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

  // 시리얼 번호 입력 처리
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
      configuration: Number(e.target.value), // ✅ 숫자로 저장
      packageType: selected, // 표시용으로 유지
    }));
  };

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  // 받아오는 이미지(객체탐지 결과)를 저장하는 const
  const [imageMap, setImageMap] = useState<Record<string, Blob>>({});

  // 이미지 캡처 콜백
  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  const handleImageCapture = (imageDataUrl: string) => {
    const file = dataURLtoFile(imageDataUrl, `capture-${Date.now()}.jpg`);

    setCapturedImages((prev) => [...prev, imageDataUrl]); // 화면용 URL
    setImageData((prev) => ({
      ...prev,
      images: [...prev.images, file], // File 객체로 추가
    }));
  };

  // 판매글 생성 처리 - handleSubmit 함수 위에 추가
  const handleGenerateContent = async () => {
    // 필수 필드 검증
    if (
      !formData.title.trim() ||
      typeof formData.price !== "number" ||
      isNaN(formData.price) ||
      formData.price <= 0 ||
      !formData.purchaseYear ||
      formData.serialNumber.trim().length === 0 ||
      imageData.images.length === 0
    ) {
      alert(
        "상품명, 가격, 구매 년도, 시리얼 번호는 필수 입력 항목이며, 최소 1장의 이미지가 필요합니다."
      );
      return;
    }

    try {
      setIsGenerating(true);

      // 구매일자 YYYY-MM 포맷
      const purchaseDateString =
        formData.purchaseMonth === "0"
          ? formData.purchaseYear
          : `${formData.purchaseYear}-${formData.purchaseMonth.padStart(
              2,
              "0"
            )}`;

      // 1. 먼저 이미지를 업로드하고 객체 탐지 결과 받아오기
      let processedImageMap = {};
      if (imageData.images.length > 0) {
        try {
          console.log("fastapi에 전송준비");
          // 기존에 정의한 uploadProductAndImages 함수 사용
          const { jsonData, imageMap } = await uploadProductAndImages(
            imageData.images,
            {
              name: formData.title,
              price: formData.price.toString(),
              description: formData.description || "",
            }
          );
          console.log("이미지 업로드 및 객체 탐지 결과:", jsonData);

          // 객체 탐지된 이미지를 상태에 저장
          setImageMap(imageMap);
          processedImageMap = imageMap;
        } catch (error) {
          console.error("이미지 업로드 실패:", error);
          alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
          setIsGenerating(false);
          return;
        }
      }

      // 2. 판매글 생성 API 호출
      const { title, description, imageUrls } = await generateSalesContent(
        imageData.images,
        {
          name: formData.title,
          price: formData.price.toString(),
          serialNumber: formData.serialNumber,
          purchaseDate: purchaseDateString,
          configuration: formData.configuration,
        }
      );

      // 생성된 판매글 설정
      setFormData((prev) => ({
        ...prev,
        title: title, // 제목도 AI가 생성한 것으로 업데이트
        description: description,
        // imageUrls: imageUrls,
      }));

      setImageData((prev) => ({
        ...prev,
        imageUrls: imageUrls,
      }));

      setIsGenerated(true);
      alert("판매글이 생성되었습니다. 내용을 확인하고 등록해주세요.");
    } catch (error) {
      console.error("판매글 생성 오류:", error);
      alert("판매글 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("=====================", formData, "=================");

    // 필수 필드 검증
    if (!formData.title.trim()) {
      alert("상품명은 필수 입력 항목입니다.");
      return;
    }
    if (!formData.purchaseYear) {
      alert("구매 일자는 필수 입력 항목입니다.");
      return;
    }
    if (formData.serialNumber.trim().length === 0) {
      alert("시리얼 번호는 필수 입력 항목입니다.");
      return;
    }
    if (formData.price <= 0) {
      alert("가격은 필수 입력 항목입니다.");
      return;
    }
    if (formData.description.trim().length === 0) {
      alert("상품 설명은 필수 입력 항목입니다.");
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

      console.log("formData.serialNumber:", formData.serialNumber);

      // 최종 설명에 구매일자와 구성여부 정보 포함
      finalDescription = `${finalDescription}`;

      const date = new Date().toISOString();
      console.log(date);

      // 상품 등록 API 호출
      const submissionData = {
        // ...formData,
        title: formData.title,
        description: finalDescription,
        price: formData.price, // 만원 단위를 원 단위로 변환 (예: 67 -> 670000)
        purchaseDate: purchaseDateString,
        configuration: formData.configuration,
        grades: formData.grades,
        status: formData.status,
        createdAt: date.toString(),
        serialNumber: formData.serialNumber,
        scratchesStatus: "scratchesStatus",
        // imageUrls: formData.imageUrls, // 업로드된 이미지 URL 배열 추가
      };

      console.log("submission: ", submissionData);

      if (editItem && editItem.itemId) {
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
        const response = await postGoods(submissionData);

        console.log("등록된 상품 정보:", response);

        const itemId = response;

        if (itemId && response && imageData.images) {
          const data = await postGoodsImage(imageData.images, itemId);
          console.log(data);
          if (data) {
            alert("상품이 등록되었습니다.");
            navigate("/my-posts", {
              state: { userId: 0, userName: useAuthStore.getState().nickname },
            });
          } else {
            alert("상품 등록에 실패하였습니다. 다시 시도해주세요.");

            return;
          }
        } else {
          alert("상품 등록에 실패하였습니다. 다시 시도해주세요.");
          return;
        }
        // }
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
          {/* 1. 상품 정보 입력 */}
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
              <option value={0}>풀박스</option>
              <option value={2}>단품</option>
              <option value={1}>일부구성품</option>
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

          {/* 5. 직접 입력하는 상품설명 (맨 마지막) */}
          {isGenerated && (
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
                    ? "어떤 구성품이 포함되어 있는지 자세히 작성해주세요."
                    : "상품 설명을 입력하세요."
                }
              />
              <p className="mt-2 text-sm text-gray-500">
                * 제목과 판매글이 AI로 자동 생성되었습니다. 내용을 확인하고
                등록해주세요.
              </p>
            </div>
          )}

          {/* 2. 사진 촬영 */}
          <div className="flex justify-between items-baseline">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사진 촬영하기
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setIsCameraOpen(true)}
                className="px-3 py-2 rounded-md bg-second/60 text-white text-sm"
              >
                촬영하기
              </button>
            </div>
          </div>
          {capturedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {capturedImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`captured-${index}`}
                  className="h-24 rounded"
                />
              ))}
            </div>
          )}
          {isCameraOpen && (
            <CameraModal
              onClose={() => setIsCameraOpen(false)}
              onCapture={handleImageCapture}
            />
          )}

          {/* 3. 게시글 생성 버튼 */}
          {capturedImages.length > 0 && !isGenerated && (
            <div className="mt-2">
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="w-full py-3 bg-first text-white font-medium rounded-md"
              >
                {isGenerating ? "게시글 생성 중..." : "게시글 생성하기"}
              </button>
              <p className="mt-2 text-sm text-gray-500 text-center">
                상품 이미지를 모두 업로드한 후 게시글 생성을 진행해주세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 버튼 영역 - sticky로 변경하여 스크롤과 무관하게 항상 표시 */}
      {capturedImages.length > 0 && isGenerated && (
        <div className="flex-1 px-3 py-7 bg-white flex gap-2 grid grid-cols-6">
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
      )}

      <div className="h-20"></div>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <NavigationBar />
      </div>
    </div>
  );
};

export default GoodsRegistrationPage;
