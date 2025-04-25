// AppRoutes.tsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import MainPage from "./pages/mainPage";
import ChatProvider from "./contexts/ChatContext";
import { ChatServiceProvider } from "./poviders/ChatServiceProvider";
import ChatListPage from "./pages/chattingPage/chatListPage";
import ChatPage from "./pages/chattingPage/chatPage";
import GoodsListPage from "./pages/goodsPage/goodsListPage";
import GoodsDetailPage from "./pages/goodsPage/goodsDetailPage";
import GoodsRegistrationPage from "./pages/goodsPage/goodsRegistrationPage";
import LoginPage from "./pages/userPage/loginPage";
import MyPage from "./pages/userPage/myPage";
import ReviewListPage from "./pages/ReviewPage/ReviewListPage";
import TransactionsPage from "./pages/TransactionPage/TransactionPage";
import FavoritePage from "./pages/FavoritesPage/FavoritesPage";
import MyPostsPage from "./pages/userPage/myPostPage";
import { getUserInfo } from "./api/users";

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // const fetchUser = async () => {
  //   const response = await getUserInfo();
  //   return response;
  // };

  // useEffect(() => {
  //   const checkUser = async () => {
  //     const user = await fetchUser();
  //     if (!user && location.pathname !== "/login") {
  //       navigate("/login");
  //     }
  //   };
  //   checkUser();
  // }, [location.pathname]);

  return (
    // <ChatServiceProvider websocketUrl="ws://115.85.181.195:8080/ws">
    //   <ChatProvider>
    // <Router>
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
      <Route path="/reviews" element={<ReviewListPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/favorites" element={<FavoritePage />} />
      <Route path="/my-posts" element={<MyPostsPage />} />
    </Routes>
    // </Router>
    //   </ChatProvider>
    // </ChatServiceProvider>
  );
};

export default AppRoutes;
