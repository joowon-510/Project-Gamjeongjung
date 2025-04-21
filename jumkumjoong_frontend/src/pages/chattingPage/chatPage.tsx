// src/pages/chattingPage/chatPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import nologo from "../../assets/nologo.svg";

interface Message {
  id: number;
  text: string;
  isMe: boolean;
  userName: string;
  timestamp: string;
}

interface ChatUser {
  id: number;
  name: string;
}

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅 상대방 정보와 메시지 불러오기 (샘플 데이터)
  useEffect(() => {
    // 실제로는 API 호출로 대체될 부분
    const userData = {
      id: parseInt(id || "0"),
      name: id === "1" ? "AI의 신예훈" : id === "2" ? "재드래곤" : "맥북헤이터",
    };

    setUser(userData);

    // 샘플 메시지 데이터 - 초기 대화가 필요하면 여기에 추가
    const sampleMessages: Message[] = [];

    setMessages(sampleMessages);
  }, [id]);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    navigate("/chat/list");
  };

  // 메시지 전송 처리
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: Date.now(), // 고유 ID 생성
      text: newMessage.trim(),
      isMe: true,
      userName: "나",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    // 자동 응답 (옵션) - 상대방이 입력한 것처럼 보이게 함
    setTimeout(() => {
      if (user) {
        const replyMsg: Message = {
          id: Date.now() + 1,
          text: getRandomReply(),
          isMe: false,
          userName: user.name,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prevMessages) => [...prevMessages, replyMsg]);
      }
    }, 1000); // 1초 후 응답
  };

  // 랜덤 응답 메시지 생성
  const getRandomReply = (): string => {
    const replies = [
      "네고 조아요;;",
      "네네 최송합니다ㅠㅠㅠㅠ",
      "아직 판매 중입니다~",
      "지금 바로 거래 가능하신가요?",
      "위치가 어디신가요?",
      "감사합니다!",
      "가격 조정은 어렵습니다ㅠㅠ",
      "내일 만나서 거래할까요?",
      "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
    ];

    return replies[Math.floor(Math.random() * replies.length)];
  };

  // 엔터 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 배경 이미지 */}
      <img
        src={nologo}
        alt="logo"
        className="absolute w-[216px] h-[216px] top-1/3 left-1/4 opacity-40 pointer-events-none z-0"
      />

      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center h-16 px-4">
          <button onClick={handleGoBack} className="p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="ml-4 text-lg font-semibold">
            {user?.name || "채팅"}
          </div>
        </div>
      </header>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 z-10">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  message.isMe ? "order-1" : "order-2"
                }`}
              >
                {/* 상대방 메시지인 경우 닉네임 표시 */}
                {!message.isMe && (
                  <div className="ml-1 text-xs text-gray-600 mb-1">
                    {message.userName}
                  </div>
                )}

                {/* 메시지 말풍선 */}
                <div
                  className={`rounded-xl px-4 py-2 max-w-[100%] ml-auto  whitespace-pre-wrap ${
                    message.isMe
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-gray-200 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="bg-white border-t p-2 z-10">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ""}
            className="ml-2 p-2 text-gray-500 disabled:text-gray-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
