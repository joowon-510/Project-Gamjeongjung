// src/pages/mainPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const MainPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">메인 페이지</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">채팅</h2>
          <div className="flex flex-col space-y-2">
            <Link 
              to="/chat/list" 
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
            >
              채팅 목록
            </Link>
            <br />
            <Link 
              to="/chat" 
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
            >
              채팅 페이지
            </Link>
          </div>
        </div>
        
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">상품</h2>
          <div className="flex flex-col space-y-2">
            <Link 
              to="/goods/list" 
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              상품 목록
            </Link>
            <br />
            <Link 
              to="/goods/detail/1" 
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              상품 상세 보기
            </Link>
            <br />
            <Link 
              to="/goods/register" 
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              상품 등록
            </Link>
          </div>
        </div>
        
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">사용자</h2>
          <div className="flex flex-col space-y-2">
            <Link 
              to="/user/login" 
              className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 text-center"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;