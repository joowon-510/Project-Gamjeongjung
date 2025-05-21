// src/pages/goodsPage/goodsRegistrationPage.tsx
import React, { useEffect, useRef, useState } from "react";
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
  // aiImages: File[]; // 캔버스에서 생성한 AI 분석 이미지
}

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface DetectionResult {
  original_filename?: string; // 추가
  filename: string;
  detections: Detection[];
}

interface ClassificationResult {
  original_filename?: string; // 추가
  filename: string;
  classification: { class: string; confidence: number };
}

interface UploadInfoResponse {
  product_name: string;
  price: string;
  classification_results: ClassificationResult[];
  detection_results: DetectionResult[];
  image_filenames?: string[]; // 👈 이 부분을 추가
}

// 이미지를 서버에 업로드하고 이미지 URL 배열을 반환하는 함수
export async function uploadProductAndImages(
  images: File[],
  productInfo: { product_name: any; price: any; description: any },
  setUploadInfoResponse: React.Dispatch<
    React.SetStateAction<UploadInfoResponse | null>
  >
) {
  const formData = new FormData();
  // 이미지 추가 전 유효성 검증
  if (!images || images.length === 0) {
    throw new Error("이미지가 필요합니다");
  }

  images.forEach((img, index) => {
    formData.append("images", img, img.name); // 파일 이름 그대로 사용
  });
  formData.append("product_name", String(productInfo.product_name || "상품"));
  formData.append("price", String(productInfo.price || "0"));
  formData.append("description", String(productInfo.description || "설명"));

  try {
    const response = await fastapiInstance.post("/upload-info", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status < 200 || response.status >= 300) {
      const errorData = response.data; // Axios는 이미 JSON 파싱을 시도했을 수 있습니다.
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    const data: UploadInfoResponse = response.data; // response.data를 그대로 사용
    setUploadInfoResponse(data);
    return data;
  } catch (error: any) {
    throw error;
  }
}

// 프론트엔드에 추가할 함수 - 기존 uploadImagesToServer 함수 아래에 추가
const generateSalesContent = async (
  classificationResults: ClassificationResult[] | null,
  detectionResults: DetectionResult[] | null, // Nullable 타입으로 변경
  imageFilenames: string[], // 이미지 파일명 리스트 추가
  productInfo: {
    name: string;
    price: string;
    serialNumber: string;
    purchaseDate: string;
    configuration: number;
  }
): Promise<{ title: string; description: string; imageUrls: string[] }> => {
  if (
    !classificationResults ||
    classificationResults.length === 0 ||
    imageFilenames.length === 0
  ) {
    throw new Error(
      "분석 결과 또는 이미지 정보가 없습니다. 먼저 사진을 촬영하고 분석을 진행해주세요."
    );
  }

  try {
    const requestData = {
      classification_results: classificationResults.map((result, index) => ({
        ...result,
        original_filename: imageFilenames[index],
      })),
      detection_results: detectionResults
        ? detectionResults.map((result, index) => ({
            // detectionResults가 있을 때만 매핑
            ...result,
            original_filename: imageFilenames[index],
          }))
        : [], // null이면 빈 배열 처리
      image_filenames: imageFilenames,
      product_name: productInfo.name,
      price: productInfo.price,
      serial_number: productInfo.serialNumber,
      purchase_date: productInfo.purchaseDate,
      configuration: productInfo.configuration.toString(),
    };

    // 판매글 생성 API 호출 (요청 바디 구조 변경)
    const response = await fastapiInstance.post(
      "/generate-description",
      requestData,
      {
        headers: {
          "Content-Type": "application/json", // 요청 Content-Type을 JSON으로 변경
        },
      }
    );

    return {
      title: response.data.title,
      description: response.data.description,
      imageUrls: response.data.image_urls || [],
    };
  } catch (error) {
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
        // images: [] as File[], // 빈 이미지 배열로 초기화
      };
    }
  });

  const [imageData, setImageData] = useState<ImageData>(() => {
    if (editItem) {
      return {
        images: [] as File[], // 빈 이미지 배열로 초기화
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

  const [uploadInfoResponse, setUploadInfoResponse] =
    useState<UploadInfoResponse | null>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  // capturedImages 타입을 string[] 에서 { url: string; file: File }[] 로 변경
  const [capturedImages, setCapturedImages] = useState<
    { url: string; file: File }[]
  >([]);

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

    setFormData((prev) => ({
      ...prev,
      configuration: Number(e.target.value),
      packageType: selected, // 표시용으로 유지
    }));
  };

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  // 이미지 캡처 콜백
  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    let mime = mimeMatch ? mimeMatch[1] : ""; // 매치 결과가 있으면 추출, 없으면 빈 문자열

    // 파일 확장자에 따라 MIME 타입 명시적으로 설정 (더 정확)
    if (
      filename.toLowerCase().endsWith(".jpg") ||
      filename.toLowerCase().endsWith(".jpeg")
    ) {
      mime = "image/jpeg";
    } else if (filename.toLowerCase().endsWith(".png")) {
      mime = "image/png";
    } else if (!mime) {
      mime = "application/octet-stream"; // 기본 MIME 타입
    }

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  const handleImageCapture = (imageDataUrl: string) => {
    const filename = `capture-${Date.now()}.jpg`;
    const file = dataURLtoFile(imageDataUrl, filename);

    setCapturedImages((prev) => [...prev, { url: imageDataUrl, file }]); // URL과 File 객체 모두 저장
    setImageData((prev) => ({
      ...prev,
      images: [...prev.images, file], // File 객체는 formData.images 에도 추가
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
      (!isSerialUnknown && formData.serialNumber.trim().length === 0) ||
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
      const purchaseDateString = useCustomDate
        ? formData.purchaseDate
        : formData.purchaseMonth === "0"
        ? formData.purchaseYear
        : `${formData.purchaseYear}-${formData.purchaseMonth.padStart(2, "0")}`;

      // 1. 먼저 이미지를 업로드하고 객체 탐지 결과 받아오기
      let uploadResult: UploadInfoResponse | null = null;
      if (imageData.images.length > 0) {
        try {
          uploadResult = await uploadProductAndImages(
            imageData.images,
            {
              product_name: formData.title,
              price: formData.price.toString(),
              description: formData.description || "",
            },
            setUploadInfoResponse // 콜백 함수 전달
          );
        } catch (error) {
          alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
          setIsGenerating(false);
          return;
        }
      }

      // 2. 판매글 생성 API 호출
      if (
        uploadResult?.classification_results &&
        uploadResult?.classification_results.length === imageData.images.length
      ) {
        const imageFilenames = uploadResult.classification_results.map(
          (res) => res.original_filename || res.filename
        );
        const { title, description, imageUrls } = await generateSalesContent(
          uploadResult.classification_results,
          uploadResult.detection_results, // detectionResults는 그대로 전달 (null일 수도 있음)
          imageFilenames,
          {
            name: formData.title,
            price: formData.price.toString(),
            serialNumber: formData.serialNumber,
            purchaseDate: purchaseDateString,
            configuration: formData.configuration,
          }
        );

        // 생성된 판매글 설정 (기존 로직 유지)
        setFormData((prev) => ({
          ...prev,
          title: title, // 제목도 AI가 생성한 것으로 업데이트
          description: description,
          imageUrls: imageUrls,
        }));

        setIsGenerated(true);
        alert("판매글이 생성되었습니다. 내용을 확인하고 등록해주세요.");
      } else {
        alert(
          "이미지 분석 결과를 받지 못했거나 이미지 개수가 맞지 않습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      alert("판매글 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.title.trim()) {
      alert("상품명은 필수 입력 항목입니다.");
      return;
    }
    if (!formData.purchaseYear) {
      alert("구매 일자는 필수 입력 항목입니다.");
      return;
    }
    if (formData.serialNumber.trim().length === 0 && !isSerialUnknown) {
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

      // finalDescription에 입력할 이미지 추가 정보.
      // 이미지 URL 추출
      const imageUrlsText = capturedImages.map((img) => img.url).join("|");

      // 분류 결과 추출 (class만)
      let classificationText = "";
      if (uploadInfoResponse?.classification_results) {
        classificationText = uploadInfoResponse.classification_results
          .map((result) => result.classification.class)
          .join("|");
      }

      // 객체 탐지 결과 추출 (class 및 bbox 좌표)
      let detectionText = "";
      if (uploadInfoResponse?.detection_results) {
        detectionText = uploadInfoResponse.detection_results
          .map((result) => {
            // 각 이미지의 탐지 결과들을 처리
            const detections = result.detections
              .map((det) => `${det.class}:(${det.bbox.join(",")})`)
              .join(";");
            return `${result.filename}>${detections}`;
          })
          .join("|");
      }

      let finalDescription = formData.description;
      if (
        formData.configuration === 1 &&
        !finalDescription.includes("구성품:")
      ) {
        finalDescription = `구성품 안내가 필요합니다. 어떤 구성품이 포함되어 있는지 작성해주세요.\n\n${finalDescription}`;
      }

      // 최종 설명에 구매일자와 구성여부 정보 포함
      finalDescription = `${finalDescription}@@${classificationText}##${detectionText}`;
      const date = new Date().toISOString();

      // 상품 등록 API 호출
      const submissionData = {
        ...formData,
        description: finalDescription,
        price: formData.price, // 만원 단위를 원 단위로 변환 (예: 67 -> 670000)
        purchaseDate: purchaseDateString,
        createdAt: date.toString(),
        serialNumber: isSerialUnknown ? "unknown" : formData.serialNumber,
        scratchesStatus: "scratchesStatus",
      };

      if (editItem && editItem.itemId) {
        try {
          const goodsId = parseInt(editItem.itemId);

          const response = await postGoodsEdit({
            ...submissionData,
            itemId: goodsId,
          });
          alert("상품 수정이 완료되었습니다.");
          navigate(`/goods/detail/${editItem.itemId}`);
        } catch (error) {}
      } else {
        const response = await postGoods(submissionData);
        const itemId = response;

        if (itemId && response && imageData.images) {
          const data = await postGoodsImage(imageData.images, itemId);
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
      }
    } catch (error) {
      alert("상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    navigate(-1);
  };

  const [useCustomDate, setUseCustomDate] = useState(false);
  const [isSerialUnknown, setIsSerialUnknown] = useState(false);

  return (
    <div className="container h-screen mx-auto text-first">
      <Header showBackButton={true} title="LOGO" hideSearchButton={true} />

      <div className="font-semibold mb-4 flex-1 overflow-y-auto">
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
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 ">
                구매일자
              </label>

              <div className=" flex items-center gap-2">
                <input
                  type="checkbox"
                  id="customDate"
                  checked={useCustomDate}
                  onChange={(e) => setUseCustomDate(e.target.checked)}
                />
                <label
                  htmlFor="customDate"
                  className="text-sm text-gray-700 font-medium"
                >
                  직접 입력
                </label>
              </div>
            </div>

            {!useCustomDate ? (
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
                    {Array.from({ length: 12 }, (_, i) =>
                      (i + 1).toString()
                    ).map((month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <input
                type="text"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                placeholder="예: 2022-08 또는 2023"
                className="w-full p-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                시리얼 넘버
              </label>
              {/* ✅ "모름" 체크박스 */}
              <div className=" flex items-center gap-2">
                <input
                  type="checkbox"
                  id="serialUnknown"
                  checked={isSerialUnknown}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setIsSerialUnknown(isChecked);
                    if (isChecked) {
                      // 입력값 초기화 또는 "모름" 처리
                      setFormData((prev) => ({
                        ...prev,
                        serialNumber: "",
                      }));
                    }
                  }}
                />
                <label
                  htmlFor="serialUnknown"
                  className="text-sm text-gray-700 font-medium"
                >
                  시리얼 넘버를 모릅니다
                </label>
              </div>
            </div>
            <SerialNumberInput
              // type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleSerialNumberChange}
              disabled={isSerialUnknown} // 체크되면 비활성화
            />
          </div>

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
              {capturedImages.map((imgitem, index) => (
                <img
                  key={index}
                  src={imgitem.url} // item 객체의 url 속성 사용
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

          {/* 4. 판매글 생성 버튼 */}
          {isGenerated && (
            <div className="mt-6 border-t pt-4">
              <p className="mt-2 text-sm text-gray-500">
                * 판매글과 제목이 AI로 자동 생성되었습니다. 내용을 확인하고
                등록해주세요.
              </p>
            </div>
          )}

          {isGenerated &&
            uploadInfoResponse &&
            uploadInfoResponse.detection_results.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2 text-gray-800">
                  AI 분석 결과
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {capturedImages.map((capturedImage, index) => {
                    const detectionResult =
                      uploadInfoResponse.detection_results.find(
                        (res) =>
                          res.original_filename === capturedImage.file.name // 원본 파일 이름으로 비교
                      );

                    return (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          display: "inline-block",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          ref={(el) => (imageRefs.current[index] = el)}
                          src={capturedImage.url}
                          alt={`analyzed-${index}`}
                          style={{ maxWidth: "100%", display: "block" }}
                          onLoad={() => {
                            const img = imageRefs.current[index];
                            const canvas = canvasRefs.current[index];
                            const ctx = canvas?.getContext("2d");

                            if (img && canvas && ctx && detectionResult) {
                              canvas.width = img.naturalWidth;
                              canvas.height = img.naturalHeight;
                              ctx.clearRect(0, 0, canvas.width, canvas.height);

                              detectionResult.detections.forEach(
                                (detection) => {
                                  const [x_min, y_min, x_max, y_max] =
                                    detection.bbox;
                                  const width = x_max - x_min;
                                  const height = y_max - y_min;
                                  const className = detection.class;
                                  let classNameKor = className; // 기본적으로 영문 유지
                                  const confidence =
                                    detection.confidence.toFixed(2);

                                  let strokeColor = "red"; // 기본 색상
                                  let fillColor = "red"; // 기본 채우기 색상

                                  switch (className) {
                                    case "Damaged Keys":
                                      strokeColor = "blue";
                                      fillColor = "blue";
                                      classNameKor = "키보드 손상";
                                      break;
                                    case "Damaged Screen":
                                      strokeColor = "green";
                                      fillColor = "green";
                                      classNameKor = "액정깨짐";
                                      break;
                                    case "Display Issues":
                                      strokeColor = "orange";
                                      fillColor = "orange";
                                      classNameKor = "화면 이상";
                                      break;
                                    case "Scratch":
                                      strokeColor = "purple";
                                      fillColor = "purple";
                                      classNameKor = "스크래치";
                                      break;
                                    case "normal":
                                      strokeColor = "red"; // 투명
                                      fillColor = "red"; // 투명
                                      break;
                                    default:
                                      break; // 기본 색상 유지
                                  }

                                  ctx.strokeStyle = strokeColor;
                                  ctx.lineWidth = 2;
                                  ctx.strokeRect(x_min, y_min, width, height);

                                  ctx.fillStyle = fillColor;
                                  ctx.font = "12px Arial";
                                  ctx.fillText(
                                    `${classNameKor} `,
                                    x_min,
                                    y_min < 5 ? y_min + 15 : y_min - 5
                                  );
                                }
                              );
                            }
                          }}
                        />
                        <canvas
                          ref={(el) => (canvasRefs.current[index] = el)}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                rows={13}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  formData.configuration === 1
                    ? "어떤 구성품이 포함되어 있는지 자세히 작성해주세요."
                    : "상품 설명을 입력하세요."
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* 6. 하단 버튼 */}
      <div className="flex-1 px-3 py-7 bg-white flex gap-2 grid grid-cols-6">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading || isGenerating}
          className="col-span-2 flex-1 py-3 bg-first/60 text-white font-medium rounded-md"
        >
          취소하기
        </button>
        {isGenerated ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="col-span-4 flex-1 py-3 bg-second text-white font-medium rounded-md"
          >
            {editItem ? "수정하기" : isLoading ? "등록 중..." : "등록하기"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="col-span-4 flex-1 py-3 bg-gray-300 text-gray-500 font-medium rounded-md"
          >
            {editItem ? "수정하기" : "등록하기"}
          </button>
        )}
      </div>
      <div className="h-[100px]"></div>

      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0">
        <NavigationBar />
      </div>
    </div>
  );
};

export default GoodsRegistrationPage;
