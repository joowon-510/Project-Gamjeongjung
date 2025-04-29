// src/pages/goodsPage/goodsDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "../../components/common/NavigationBar";
import GoodsImage from "../../components/goods/GoodsImage";
import GoodsStatus from "../../components/goods/GoodsStatus";
// import { getGoodsDetail } from "../../services/goodsService";
import { GoodsDetailProps } from "../../components/goods/GoodsItem";
import { getGoodsDetail, postGoodsFavorites } from "../../api/goods";

import Heart from "../../assets/Heart.svg";
import HeartEmpty from "../../assets/HeartEmpty.svg";

import { useWishItemStore, WishItemState } from "../../stores/useUserStore";
import { formatDateManually } from "../../utils/dateFormatter";

const GoodsDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [goods, setGoods] = useState<GoodsDetailProps | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 상품 평점 (하드코딩)
  const [rating] = useState("4.5");

  // 상품 상태 정보 (하드코딩)
  const [productStatus] = useState({
    frontScratch: 2,
    frontPan: 0,
    backScratch: 0,
    backPan: 0,
    sideScratch: 1,
    sidePan: 0,
    // 추가된 속성
    side1Scratch: 1,
    side1Pan: 0,
    side2Scratch: 0,
    side2Pan: 0,
    keyboardScratch: 1,
    keyboardPan: 0,
    screenScratch: 2,
    screenPan: 0,
  });

  useEffect(() => {
    const loadGoodsDetail = async () => {
      if (!itemId) return;

      try {
        setIsLoading(true);
        setError(null);
        const goodsId = parseInt(itemId);
        const goodsData = await getGoodsDetail(goodsId);

        console.log(goodsData);

        if (goodsData) {
          setGoods(goodsData.data.body);
          const exits = goodsData.data.body.isFavorite;
          console.log("setGoods: ", goods);

          setFavorite(exits);
        } else {
          setError("상품을 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("상품 상세 정보 로딩 오류:", err);
        setError("상품 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadGoodsDetail();
  }, [itemId]);

  // 뒤로가기 처리
  const handleGoBack = () => {
    navigate(-1);
  };

  // 채팅하기 처리
  const handleChat = () => {
    // 채팅 기능 미구현
    alert("채팅 기능은 아직 구현되지 않았습니다.");
  };

  // 로컬 상태로 찜하기 여부 관리 (목업용)
  const [favorite, setFavorite] = useState(false);
  const { items, addItem, removeItem } = useWishItemStore();

  // useEffect(() => {
  //   if (!itemId) return;

  //   // 현재 상품이 찜 목록에 있는지 확인
  //   const exists = items.some((item) => item.itemId === parseInt(itemId));
  //   setFavorite(exists);
  // }, [itemId, items]);

  // 찜하기 버튼 클릭 핸들러 (목업용)
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // 링크 이동 방지

    if (!itemId) {
      console.error("itemId가 없습니다.");
      return;
    }

    if (!goods || !goods.item) {
      console.error("상품 정보가 없습니다.");
      return;
    }

    const goodsId = parseInt(itemId, 10);
    const exists = items.some((item) => item.itemId === goodsId);

    const wishItem: WishItemState = {
      createdAt: goods.item.createdAt,
      itemId: goods.item.itemId,
      itemName: goods.item.title,
      itemPrice: goods.item.price,
      itemStatus: goods.item.status,
    };

    // ✅ 하트 아이콘을 "바로" 바꾼다
    setFavorite(!exists);

    // 찜 요청 api 연결
    try {
      if (exists) {
        removeItem(wishItem.itemId);
        console.log("찜 해제 요청 보내는 중...");
      } else {
        console.log("찜 추가 요청 보내는 중...");
        await postGoodsFavorites(goodsId);
        addItem(wishItem);
      }
    } catch (error) {
      console.log("찜 요청 실패: ", error);

      setFavorite(exists); // 실패했으면 다시 원래대로
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !goods) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex-1 p-4 flex flex-col justify-center items-center">
          <p className="text-red-500 mb-4">
            {error || "상품 정보를 찾을 수 없습니다."}
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 상품 이미지 컴포넌트 */}
        <GoodsImage
          imageUrl="../../assets/goods/thumbnail.png"
          title={goods.item.title}
          time={goods.item.createdAt}
          onGoBack={handleGoBack}
        />

        {/* 판매자 정보 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <p className="text-gray-700">판매자: {goods.userName}</p>
            <div className="flex gap-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1">{rating}</span>
              </div>
              {/* 하트 버튼 (찜하기) - 이미지 위에 겹쳐서 표시 */}
              <button className=" rounded-full" onClick={handleFavoriteClick}>
                {goods.isFavorite ? (
                  <img src={Heart} alt="heart" className="w-6 h-6" />
                ) : (
                  <img src={HeartEmpty} alt="HeartEmpty" className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 작성 일자 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">작성 일자</span>
            <span className="font-medium">
              {formatDateManually(goods.item.createdAt).date}{" "}
              {formatDateManually(goods.item.createdAt).time}
            </span>
          </div>
        </div>

        {/* 상품 설명 */}
        <div className="p-4 border-b">
          <p className="text-gray-800">{goods.item.description}</p>
        </div>

        {/* 시리얼 넘버 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">시리얼 번호</span>
            <span className="font-medium">{goods.item.serialNumber}</span>
          </div>
        </div>
        {/* 기종 정보 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">기종</span>
            <span className="font-medium">갤럭시북 5 PRO</span>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">AI의 평가점수</span>
            <span className="font-medium">92점</span>
          </div>
        </div>

        {/* 판매가 정보 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">판매가</span>
            <span className="font-bold text-lg">{goods.item.price}</span>
          </div>
        </div>

        {/* 상품 상태 컴포넌트 */}
        <GoodsStatus
          frontScratch={productStatus.frontScratch}
          frontPan={productStatus.frontPan}
          backScratch={productStatus.backScratch}
          backPan={productStatus.backPan}
          sideScratch={productStatus.sideScratch}
          sidePan={productStatus.sidePan}
          side1Scratch={productStatus.side1Scratch}
          side1Pan={productStatus.side1Pan}
          side2Scratch={productStatus.side2Scratch}
          side2Pan={productStatus.side2Pan}
          keyboardScratch={productStatus.keyboardScratch}
          keyboardPan={productStatus.keyboardPan}
          screenScratch={productStatus.screenScratch}
          screenPan={productStatus.screenPan}
        />

        {/* 하단 여백 (네비게이션 바와 액션 바 높이만큼) */}
        <div className="h-32"></div>
      </div>

      {/* 하단 고정 액션 바 */}
      <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t p-3 flex items-center">
        <div className="flex-1">
          <span className="text-gray-700 mr-2">가격:</span>
          <span className="text-xl font-bold">{goods.item.price}</span>
        </div>
        <button
          onClick={handleChat}
          className="px-6 py-2 bg-blue-400 text-white font-medium rounded-md"
        >
          채팅하기
        </button>
      </div>

      {/* 하단 네비게이션 바 */}
      {/* <div className="fixed bottom-0 left-0 right-0 z-10"> */}
      <NavigationBar />
      {/* </div> */}
    </div>
  );
};

export default GoodsDetailPage;
