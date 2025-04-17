import React from 'react';
import { useParams } from 'react-router-dom';

const GoodsDetailPage: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div>
      <h1>상품 상세 페이지</h1>
      <p>상품 ID: {id}</p>
      <p>여기에 상품 상세 정보가 표시됩니다.</p>
    </div>
  );
};

export default GoodsDetailPage;