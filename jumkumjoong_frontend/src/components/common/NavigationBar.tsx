// src/components/common/NavigationBar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import plusCircle from "../../assets/icons/PlusCircle.svg";
import heart from "../../assets/icons/Heart.svg";
import userProfile from "../../assets/icons/user-profile.svg";
import messageChat from "../../assets/icons/message-chat.svg";
import menu from "../../assets/icons/menu.svg";
import { useChatStore } from "../../stores/chatStore";
import MenuModal from "./MenuModal";

interface NavigationBarProps {
  activeMenu?: "home" | "favorite" | "add" | "my" | "chat";
}

interface ApiResponse {
  body: {
    content: Array<{
      roomId: string;
      nonReadCount: number;
    }>;
    empty: boolean;
  };
  status_code: number;
}

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const NavigationBar: React.FC<NavigationBarProps> = ({
  activeMenu = "home",
}) => {
  const { chatRooms, setChatRooms } = useChatStore();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // API 호출 함수 (간단한 버전)
  const loadUnreadCounts = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      console.log("[NavigationBar] 읽지 않은 메시지 수 확인 중...");

      const response = await axios.get<ApiResponse>(
        `${BASE_URL}/chatting?page=0&size=10`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken || ""}`,
          },
        }
      );

      if (response.data && response.data.status_code === 200) {
        const rooms = response.data.body.content;
        const total = rooms.reduce(
          (sum, room) => sum + (room.nonReadCount || 0),
          0
        );
        setTotalUnreadCount(total);

        // 로컬스토리지에 저장
        localStorage.setItem("totalUnreadMessages", total.toString());

        console.log("[NavigationBar] 전체 읽지 않은 메시지 수:", total);
      }
    } catch (error) {
      console.error("[NavigationBar] API 호출 실패:", error);
      // 에러 시 로컬스토리지에서 읽기
      const storedCount = localStorage.getItem("totalUnreadMessages");
      if (storedCount) {
        setTotalUnreadCount(parseInt(storedCount) || 0);
      }
    }
  };

  // store의 chatRooms가 변경될 때마다 계산 (ChatListPage가 열려 있을 때)
  useEffect(() => {
    if (chatRooms.length > 0) {
      const total = chatRooms.reduce(
        (sum, room) => sum + (room.nonReadCount || 0),
        0
      );
      setTotalUnreadCount(total);
      console.log("[NavigationBar] Store에서 읽지 않은 메시지 수:", total);
    }
  }, [chatRooms]);

  // 독립적인 폴링 설정
  useEffect(() => {
    // 초기 로드
    loadUnreadCounts();

    // 주기적 업데이트 (10초마다 - ChatListPage와 엇갈리도록)
    intervalRef.current = setInterval(() => {
      if (!document.hidden) {
        loadUnreadCounts();
      }
    }, 10000);

    // 클린업
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 페이지 포커스 시 즉시 업데이트
  useEffect(() => {
    const handleFocus = () => {
      loadUnreadCounts();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUnreadCounts();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(true);
    }
  };

  return (
    <>
      <footer className="z-[110] sticky bottom-0 w-[100%] flex gap-2 shadow-[0_-3px_5px_rgba(0,0,0,0.15)] z-50 p-2 pb-3 bg-white">
        {/* 메뉴 */}
        <button
          onClick={handleMenu}
          className="w-full justify-items-center pt-2"
        >
          <img src={menu} alt="menu" className="w-[40px]" />
          <p className="font-semibold text-first/70">메뉴</p>
        </button>

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
        <Link
          to="/chatting/list"
          className="w-full gap-2 justify-items-center pt-2 relative"
        >
          <div className="relative flex flex-col items-center">
            <img src={messageChat} alt="messageChat" className="w-[40px]" />

            {/* 읽지 않은 메시지가 있을 때만 배지 표시 */}
            {totalUnreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
              </span>
            )}

            <p className="font-semibold text-first/70">채팅</p>
          </div>
        </Link>
      </footer>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white">
          <MenuModal
            onClose={() => setIsMenuOpen(false)}
            onOpen={() => setIsMenuOpen(true)}
          />
        </div>
      )}
    </>
  );
};

export default NavigationBar;
