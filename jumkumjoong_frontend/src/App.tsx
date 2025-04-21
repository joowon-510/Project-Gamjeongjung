// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/mainPage';
import ChatListPage from './pages/chattingPage/chatListPage';
import ChatPage from './pages/chattingPage/chatPage';
import GoodsListPage from './pages/goodsPage/goodsListPage';
import GoodsDetailPage from './pages/goodsPage/goodsDetailPage';
import GoodsRegistrationPage from './pages/goodsPage/goodsRegistrationPage';
import LoginPage from './pages/userPage/loginPage';
import MyPage from './pages/userPage/myPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<MainPage />} />

        {/* 로그인 페이지 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 채팅 관련 페이지 */}
        <Route path="/chat/list" element={<ChatListPage />} />
        <Route path="/chat/:chatid" element={<ChatPage />} />

        {/* 상품 관련 페이지 */}
        <Route path="/goods/list" element={<GoodsListPage />} />
        <Route path="/goods/detail/:id" element={<GoodsDetailPage />} />
        <Route path="/goods/register" element={<GoodsRegistrationPage />} />

        {/* 사용자 관련 페이지 */}
        <Route path="/user/login" element={<LoginPage />} />

        <Route path="/mypage" element={<MyPage />} />

      </Routes>
    </Router>
  );
}

export default App;
