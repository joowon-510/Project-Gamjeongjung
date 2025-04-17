// src/api/goods.ts
import axios from 'axios';
import { GoodsItemProps } from '../components/goods/GoodsItem';

// API 기본 URL 설정 (환경에 맞게 변경)
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 상품 목록 가져오기
export const fetchGoods = async (searchTerm?: string): Promise<GoodsItemProps[]> => {
  try {
    // 검색어가 있으면 쿼리 파라미터로 추가
    const url = searchTerm 
      ? `${BASE_URL}/goods?search=${encodeURIComponent(searchTerm)}` 
      : `${BASE_URL}/goods`;
    
    const response = await axios.get(url);
    
    // 백엔드 응답 데이터 형식에 맞게 매핑
    // 백엔드 응답 구조가 다를 경우 여기서 형식을 변환
    return response.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      price: `${item.price.toLocaleString()}원`,
      time: formatTimeAgo(new Date(item.createdAt)),
      seller: item.sellerName,
      imageUrl: item.imageUrl // 이미지 URL
    }));
  } catch (error) {
    console.error('상품 데이터 가져오기 실패:', error);
    throw error;
  }
};

// 경과 시간 포맷팅 (예: "2시간 전", "1일 전")
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else {
    return `${diffDay}일 전`;
  }
};