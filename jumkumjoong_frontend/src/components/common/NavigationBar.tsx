// src/components/common/NavigationBar.tsx
import React from "react";
import { Link } from "react-router-dom";
import plusCircle from "../../assets/PlusCircle.svg";
import heart from "../../assets/Heart.svg";
import userProfile from "../../assets/user-profile.svg";
import messageChat from "../../assets/message-chat.svg";
import menu from "../../assets/menu.svg";
import { useChatContext } from '../../contexts/ChatContext';

// NavigationBarProps 인터페이스 정의
interface NavigationBarProps {
  activeMenu?: 'home' | 'favorite' | 'add' | 'my' | 'chat';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeMenu = 'home' }) => {
  // ChatContext에서 읽지 않은 메시지 수 가져오기
  const { unreadMessageCount } = useChatContext();

  return (
    <footer className="sticky bottom-0 w-[100%] flex gap-2 shadow-[0_-3px_5px_rgba(0,0,0,0.15)] z-50 p-2 pb-3 bg-white">
      {/* 밑에 있는 Nav바 */}
      {/* 메뉴 */}
      <div className="w-full gap-2 justify-items-center pt-2">
        <img src={menu} alt="menu" className="w-[40px]" />
        <p className="font-semibold text-first/70">메뉴</p>
      </div>
      {/* 찜 */}
      <Link
        to="/favorites"
        className="w-full gap-2 justify-items-center pt-2"
      >
        <img src={heart} alt="heart" className="w-[40px]" />
        <p className="font-semibold text-first/70">찜</p>
      </Link>
      {/* 등록 */}
      <Link
        to="/goods/register"
        className="w-full gap-2 justify-items-center pt-2"
      >
        <img src={plusCircle} alt="plusCircle" className="w-[40px]" />
        <p className="font-semibold text-first/70">등록</p>
      </Link>
      {/* MY */}
      <Link to="/mypage" className="w-full gap-2 justify-items-center pt-2">
        <img src={userProfile} alt="userProfile" className="w-[40px]" />
        <p className="font-semibold text-first/70">MY</p>
      </Link>
      {/* 채팅 */}
      <Link to="/chat/list" className="w-full gap-2 justify-items-center pt-2 relative">
        <img src={messageChat} alt="messageChat" className="w-[40px]" />
        
        {/* 읽지 않은 메시지가 있을 때만 배지 표시 */}
        {unreadMessageCount > 0 && (
          <span className="absolute top-0 right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
          </span>
        )}
        
        <p className="font-semibold text-first/70">채팅</p>
      </Link>
    </footer>
  );
};

export default NavigationBar;