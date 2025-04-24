// src/pages/chattingPage/chatListPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import chatting from "../../assets/message-chat.svg";

// 채팅 목록 데이터 인터페이스
interface ChatItem {
  id: number;
  userName: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
}

const ChatListPage: React.FC = () => {
  // 샘플 채팅 목록 데이터
  const chatList: ChatItem[] = [
    {
      id: 1,
      userName: "AI의 신예훈",
      lastMessage: "죽시 필요나요..?",
      unreadCount: 1,
      timestamp: "오전 11:30",
    },
    {
      id: 2,
      userName: "재드래곤",
      lastMessage: "네고되나요",
      unreadCount: 1,
      timestamp: "어제",
    },
    {
      id: 3,
      userName: "맥북헤이터",
      lastMessage: "맥북은 안 파시나요",
      unreadCount: 1,
      timestamp: "3일 전",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <Header title="LOGO" showBackButton={false} hideSearchButton={false} />

      {/* 채팅 목록 타이틀 */}
      <div className="px-4 py-3 border-b">
        <h1 className="text-xl font-bold">채팅</h1>
      </div>

      {/* 채팅 목록 */}
      <div className="flex-1 overflow-y-auto">
        {chatList.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {chatList.map((chat) => (
              <li key={chat.id} className="px-4 py-3">
                <Link to={`/chat/${chat.id}`} className="flex items-center">
                  {/* 프로필 이미지 (원형) */}
                  <div className="relative">
                    <img src={chatting} alt="heart" className="w-[40px]" />
                    {/* <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      <svg
                        className="w-8 h-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div> */}
                    {/* 읽지 않은 메시지 표시 (현재 비활성화)
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                        {chat.unreadCount}
                      </div>
                    )}
                    */}
                  </div>

                  {/* 채팅 정보 */}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{chat.userName}</span>
                      <span className="text-xs text-gray-500">
                        {chat.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>채팅 내역이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 바 */}
      {/* <div> */}
      <NavigationBar />
      {/* </div> */}
    </div>
  );
};

export default ChatListPage;
