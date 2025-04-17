// src/pages/goodsPage/goodsDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from '../../components/common/NavigationBar';
import GoodsImage from '../../components/goods/GoodsImage';
import GoodsStatus from '../../components/goods/GoodsStatus';
import { getGoodsDetail } from '../../services/goodsService';
import { GoodsItemProps } from '../../components/goods/GoodsItem';

const GoodsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goods, setGoods] = useState<GoodsItemProps | null>(null);
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
    screenPan: 0
  });

  useEffect(() => {
    const loadGoodsDetail = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const goodsId = parseInt(id);
        const goodsData = await getGoodsDetail(goodsId);
        
        if (goodsData) {
          setGoods(goodsData);
        } else {
          setError('상품을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('상품 상세 정보 로딩 오류:', err);
        setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGoodsDetail();
  }, [id]);
  
  // 뒤로가기 처리
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // 채팅하기 처리
  const handleChat = () => {
    // 채팅 기능 미구현
    alert('채팅 기능은 아직 구현되지 않았습니다.');
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
          <p className="text-red-500 mb-4">{error || '상품 정보를 찾을 수 없습니다.'}</p>
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
          imageUrl={goods.imageUrl}
          title={goods.title}
          time={goods.time}
          onGoBack={handleGoBack}
        />
        
        {/* 판매자 정보 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <p className="text-gray-700">판매자: {goods.seller}</p>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1">{rating}</span>
            </div>
          </div>
        </div>
        
        {/* 상품 설명 */}
        <div className="p-4 border-b">
          <p className="text-gray-800">
            구매한지 1달 된 거의 새제품 팝니다.<br />
            이번에 맥북 선물받아서 파는 거라 제품에는 문제 없습니다.<br />
            홍플러스 앞에서 거래할게요
          </p>
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
            <span className="text-gray-700">AI 추천가</span>
            <span className="font-medium">92만원</span>
          </div>
        </div>
        
        {/* 판매가 정보 */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">판매가</span>
            <span className="font-bold text-lg">{goods.price}</span>
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
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t p-3 flex items-center">
        <div className="flex-1">
          <span className="text-gray-700 mr-2">가격:</span>
          <span className="text-xl font-bold">{goods.price}</span>
        </div>
        <button 
          onClick={handleChat}
          className="px-6 py-2 bg-blue-400 text-white font-medium rounded-md"
        >
          채팅하기
        </button>
      </div>
      
      {/* 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <NavigationBar />
      </div>
    </div>
  );
};

export default GoodsDetailPage;