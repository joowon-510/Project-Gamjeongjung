// src/components/common/NavigationBar.tsx
import React from "react";
import { Link } from "react-router-dom";
import plusCircle from "../../assets/PlusCircle.svg";
import heart from "../../assets/Heart.svg";
import userProfile from "../../assets/user-profile.svg";
import messageChat from "../../assets/message-chat.svg";
import menu from "../../assets/menu.svg";

const NavigationBar: React.FC = () => {
  return (
    // <nav className="sticky bottom-0 z-10 bg-white border-t">
    //   <div className="flex justify-around items-center h-14">
    //     <Link to="/" className="flex flex-col items-center justify-center text-gray-600">
    //       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    //       </svg>
    //     </Link>

    //     <Link to="/chat/list" className="flex flex-col items-center justify-center text-gray-600">
    //       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    //       </svg>
    //     </Link>

    //     <Link to="/user/login" className="flex flex-col items-center justify-center text-gray-600">
    //       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    //       </svg>
    //     </Link>
    //   </div>
    // </nav>
    <footer className="sticky bottom-0  w-[100%] flex gap-2 shadow-[0_-3px_5px_rgba(0,0,0,0.15)] z-50 p-2 pb-3 bg-white">
      {/* 밑에 있는 Nav바 */}
      {/* 메뉴 */}
      <div className="w-full gap-2 justify-items-center pt-2">
        <img src={menu} alt="menu" className="w-[40px]" />
        <p className="font-semibold text-first/70">메뉴</p>
      </div>
      {/* 찜 */}
      <div className="w-full gap-2 justify-items-center pt-2">
        <img src={heart} alt="heart" className="w-[40px]" />
        <p className="font-semibold text-first/70">찜</p>
      </div>
      {/* 등록 */}
      <Link
        to="/goods/register"
        className="w-full gap-2 justify-items-center pt-2"
      >
        <img src={plusCircle} alt="plusCircle" className="w-[40px]" />
        <p className="font-semibold text-first/70">등록</p>
      </Link>
      {/* MY */}
      <div className="w-full gap-2 justify-items-center pt-2">
        <img src={userProfile} alt="userProfile" className="w-[40px]" />
        <p className="font-semibold text-first/70">MY</p>
      </div>
      {/* 채팅 */}
      <Link to="/chat/list" className="w-full gap-2 justify-items-center pt-2">
        <img src={messageChat} alt="messageChat" className="w-[40px]" />
        <p className="font-semibold text-first/70">채팅</p>
      </Link>
    </footer>
  );
};

export default NavigationBar;
