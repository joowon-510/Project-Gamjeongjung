// src/pages/goodsPage/goodsDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NavigationBar from "../../components/common/NavigationBar";
import GoodsImage from "../../components/goods/GoodsImage";
import GoodsStatus from "../../components/goods/GoodsStatus";
import DamageOverlayImage from "../../components/goods/DamageOverlayImage";
import { GoodsDetailProps } from "../../components/goods/GoodsItem";

import {
  deleteGoods,
  getGoodsDetail,
  postGoodsFavorites,
} from "../../api/goods";

import Heart from "../../assets/icons/Heart.svg";
import HeartEmpty from "../../assets/icons/HeartEmpty.svg";
import star from "../../assets/icons/starFilled.svg";
import thumbnail from "../../assets/icons/nologo.svg";

import {
  useWishItemStore,
  WishItemState,
  useAuthStore,
} from "../../stores/useUserStore";
import { formatDateManually } from "../../utils/dateFormatter";

import ChatButton from "../../components/chat/chatButton";

const GoodsDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [goods, setGoods] = useState<GoodsDetailProps | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { nickname } = useAuthStore();
  const [edit, setEdit] = useState(false);
  const [favorite, setFavorite] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [productInfo, setProductInfo] = useState<string[]>([]);

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

        console.log("🌐 API 전체 응답:", goodsData);
        console.log("📦 API 응답 body:", goodsData.body);

        if (goodsData.status_code === 200) {
          // itemId를 명시적으로 설정
          const updatedGoodsData = {
            ...goodsData.body,
            item: {
              ...goodsData.body.item,
              itemId: goodsId, // 라우트의 itemId 사용
            },
          };

          setGoods(updatedGoodsData);
          setRating(goodsData.body.userRating.toFixed(2));
          setImages(goodsData.body.item.deviceImageList);
          const exits = goodsData.body.isFavorite;
          setFavorite(exits);
          setProductInfo(
            goodsData.body.item.description.includes("@@")
              ? goodsData.body.item.description.split("@@")[1].split("##")
              : []
          );
          console.log(exits);

          console.log("🔍 업데이트된 상품 데이터:", updatedGoodsData);
        } else if (goodsData.status_code === 400) {
          setError("탈퇴한 사용자입니다.");
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

  useEffect(() => {
    if (goods?.userName && nickname === goods.userName) {
      setEdit(true);
    }
  }, [goods, nickname]);

  // 뒤로가기 처리
  const handleGoBack = () => {
    navigate(-1);
  };

  // 삭제하기 처리
  const handleDelete = async () => {
    try {
      if (!itemId) {
        console.error("itemId가 없습니다.");
        return;
      }
      const goodsId = parseInt(itemId, 10);
      const response = await deleteGoods(goodsId);
      if (response.data.status_code === 200) {
        alert("삭제가 완료되었습니다.");
        navigate("/my-posts", {
          state: { userId: 0, userName: useAuthStore.getState().nickname },
        });
      }
    } catch (error) {
      console.log();
    }
  };

  // 수정하기 처리
  const handleEdit = async () => {
    if (goods?.item) {
      navigate(`/goods/register`, { state: { ...goods.item, itemId } });
    }
  };

  const { items, addItem, removeItem } = useWishItemStore();

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
      deviceImageUrl: !goods.item.deviceImageUrl
        ? thumbnail
        : goods.item.deviceImageUrl[0],
    };

    // ✅ 하트 아이콘을 "바로" 바꾼다
    setFavorite(!exists);

    // 찜 요청 api 연결
    try {
      if (exists) {
        console.log("찜 해제 요청 보내는 중...");
        const response = await postGoodsFavorites(goodsId);
        console.log(response);
        removeItem(wishItem.itemId);
        console.log("removeItem: ", items);
      } else {
        console.log("찜 추가 요청 보내는 중...");
        if (!exists) {
          const response = await postGoodsFavorites(goodsId);
          console.log(response);
          addItem(wishItem);
          console.log("wishItem: ", items);
        }
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
  // GoodsDetailPage 컴포넌트 내부
  console.log("🔍 상품 상세 데이터:", {
    goodsData: goods,
    item: goods.item,
    itemId: goods.item.itemId,
    userId: goods.item.userId,
    userName: goods.userName,
    itemTitle: goods.item.title,
  });
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* 상품 이미지 컴포넌트 */}
        <GoodsImage
          imageUrl={images[0]}
          title={goods.item.title}
          canChangeStatus={goods.item.status}
          onGoBack={handleGoBack}
        />

        {/* 판매자 정보 */}
        <div className="p-4 border-b">
          {edit ? (
            <div className="mb-3 flex justify-end ml-3 gap-4">
              <button className=" text-second underline" onClick={handleEdit}>
                수정
              </button>
              <button className=" text-fifth underline" onClick={handleDelete}>
                삭제
              </button>
            </div>
          ) : (
            <></>
          )}

          <div className="flex justify-between items-center">
            <div
              className=""
              onClick={() => {
                navigate(`/page/${goods.userName}`, {
                  state: {
                    userName: goods.userName,
                    userRating: goods.userRating,
                    userId: goods.item.userId,
                  },
                });
              }}
            >
              <p className="text-gray-700">판매자: {goods.userName}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center">
                <img src={star} alt="rating-start" className="w-5 h-5" />
                <span className="ml-1">{rating}</span>
              </div>
              {/* 하트 버튼 (찜하기) - 이미지 위에 겹쳐서 표시 */}
              <button className=" rounded-full" onClick={handleFavoriteClick}>
                {favorite ? (
                  // {goods.isFavorite ? (
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
          <p className="text-gray-800 whitespace-pre-line">
            {goods.item.description.split("@@")[0]}
          </p>
        </div>

        {/* 시리얼 넘버 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">시리얼 번호</span>
            <span className="font-medium">{goods.item.serialNumber}</span>
          </div>
        </div>

        {/* 판매가 정보 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">판매가</span>
            <span className="font-bold text-lg">{goods.item.price} 원</span>
          </div>
        </div>

        {/* 상품 상태 컴포넌트 */}
        <GoodsStatus status={productInfo} />

        <div className="flex flex-col items-center gap-4">
          {/* {images.length > 0 ? (
            images.map((itemImg) => {
              return (
                <div className="flex justify-center gap-4 w-[100%]">
                  <img src={itemImg} alt="item-image" className="w-[40%]" />
                  <img src={itemImg} alt="item-image" className="w-[40%]" />
                </div>
              );
            })
          ) : (
            <></>
          )} */}
          {images.length > 0 &&
            productInfo.length > 1 &&
            productInfo[1].split("|").map((entry, idx) => {
              const [imageUrl, damageData] = entry.split(">");
              const fullImageUrl = images[idx] || thumbnail;
              return (
                <div className="flex justify-center gap-4 w-full" key={idx}>
                  {/* 원본 이미지 */}
                  <img
                    src={fullImageUrl}
                    alt="item-image"
                    className="w-[40%] rounded-[4px]"
                  />

                  {/* 데미지 오버레이 이미지 */}
                  <DamageOverlayImage
                    imageUrl={fullImageUrl}
                    damageStr={entry}
                    width={150}
                    height={200}
                  />
                </div>
              );
            })}
        </div>

        {/* 하단 여백 (네비게이션 바와 액션 바 높이만큼) */}
        <div className="h-8"></div>
      </div>

      {/* 하단 고정 액션 바 */}
      <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t p-3 flex items-center">
        <div className="flex-1">
          <span className="text-gray-700 mr-2">가격:</span>
          <span className="text-xl font-bold">{goods.item.price} 원</span>
        </div>
        <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t p-3 mb-1 flex items-center">
          <div className="flex-1">
            <span className="text-gray-700 mr-2">가격:</span>
            <span className="text-xl font-bold">{goods.item.price} 원</span>
          </div>
          {nickname !== goods.userName ? (
            <ChatButton
              sellerId={goods.item.userId}
              itemId={goods.item.itemId || parseInt(itemId!, 10)} // 명시적으로 itemId 전달
              sellerName={goods.userName}
              itemTitle={goods.item.title}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      {/* 하단 네비게이션 바 */}
      {/* <div className="fixed bottom-0 left-0 right-0 z-10"> */}
      <NavigationBar />
      {/* </div> */}
    </div>
  );
};

export default GoodsDetailPage;
