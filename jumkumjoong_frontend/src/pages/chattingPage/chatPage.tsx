// src/pages/chattingPage/chatPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import nologo from "../../assets/nologo.svg";
import useChat from "../../hooks/useChat";
import { ChatUser, Message } from "../../types/chat";
import { ChatRouteState, getChatMessages } from "../../api/chat";
import { useChatContext } from "../../contexts/ChatContext";
import { format, isToday, isYesterday } from 'date-fns';

const ChatPage: React.FC = () => {
  const { chatid } = useParams<{ chatid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<ChatUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ChatContext 사용 (읽음 표시를 위해)
  const { markRoomAsRead } = useChatContext();
  
  // 현재 사용자 ID (하드코딩, 실제로는 로그인한 사용자의 ID를 사용해야 함)
  const currentUserId = 1;
  const roomId = 'UJ3KFeYtSwO2LALw080adg=='; // string을 number로 변환

  // 날짜 포맷팅 함수
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
      
    if (isToday(date)) {
      // 오늘이면 시간만 표시
      return format(date, 'p');
    } else if (isYesterday(date)) {
      // 어제면 '어제' 표시
      return format(date, '어제 p');
    } else {
      // 그 외의 경우 날짜와 시간 표시
      return format(date, 'yy.MM.dd p');
    }
  };

  // useChat 훅 사용
  const {
    messages,
    newMessage,
    isConnected,
    sendMessage,
    handleInputChange,
    handleKeyPress,
    setInitialMessages
  } = useChat({
    roomId,
    userId: currentUserId,
    recipientName: user?.name || ""
  });

  // 채팅방 초기 데이터 로드
  useEffect(() => {
    const loadInitialChatData = async () => {
      try {
        // 타입 단언을 사용하여 state 접근
        const state = location.state as ChatRouteState;
        
        // 닉네임 추출 로직 - location.state에서 chattingUserNickname을 우선적으로 사용
        const chattingUserNickname = state?.chattingUserNickname || 
          (chatid === "1" ? "AI의 신예훈" : 
           chatid === "2" ? "재드래곤" : 
           "맥북헤이터");
  
        // roomId를 문자열로 변환하여 API 호출
        const response = await getChatMessages(roomId.toString());
        
        if (response && response.status_code === 200) {
          // 초기 메시지 설정 - 모든 id를 string으로 처리
          const formattedMessages: Message[] = response.body.messages.map(msg => ({
            id: msg.messageId || `msg_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`, // 기본값 제공
            text: msg.text || '', // 기본값 제공
            timestamp: msg.timestamp || new Date().toISOString(), // 기본값 제공
            isMe: msg.senderId === currentUserId, 
            userName: msg.senderId === currentUserId ? '나' : chattingUserNickname,
            read: msg.isRead !== undefined ? msg.isRead : true, // 기본값 제공
            receivedAt: new Date().toISOString() // 항상 현재 시간 사용
          }));
          
          setInitialMessages(formattedMessages);
          
          // 채팅 상대방 정보 설정 - 전달된 닉네임을 우선 사용
          setUser({
            id: response.body.participant.userId,
            name: chattingUserNickname
          });
        } else {
          // API 호출 실패 시 기본 데이터 사용
          setUser({
            id: 0,
            name: chattingUserNickname // 전달된 닉네임 사용
          });
        }
      } catch (error) {
        console.error('채팅방 초기 데이터 로드 실패:', error);
        
        // state에서 전달된 chattingUserNickname 사용
        const state = location.state as ChatRouteState;
        const chattingUserNickname = state?.chattingUserNickname || 
          (chatid === "1" ? "AI의 신예훈" : 
           chatid === "2" ? "재드래곤" : 
           "맥북헤이터");
        
        // 샘플 데이터
        const userData = {
          id: 0,
          name: chattingUserNickname // 전달된 닉네임 사용
        };
        setUser(userData);
      }
    };
  
    loadInitialChatData();
  }, [chatid, currentUserId, location.state, roomId]);

  // 채팅방에 들어왔을 때 읽음 표시 처리
  useEffect(() => {
    if (isConnected && roomId) {
      markRoomAsRead(roomId);
    }
  }, [isConnected, roomId, markRoomAsRead]);

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

  // 메시지 전송 버튼 핸들러 - 디버깅을 위해 로그 추가
  const handleSendButtonClick = () => {
    console.log('Sending message:', newMessage);
    sendMessage();
    // 스크롤을 아래로 내립니다
    setTimeout(scrollToBottom, 100);
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
          {!isConnected && (
            <div className="ml-2 text-xs text-red-500">연결 중...</div>
          )}
          {isConnected && (
            <div className="ml-2 text-xs text-green-500">연결됨</div>
          )}
        </div>
      </header>

      {/* 디버깅 정보 (개발 중에만 사용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 p-2 text-xs">
          <div>Room ID: {roomId}</div>
          <div>User ID: {currentUserId}</div>
          <div>Connection: {isConnected ? 'Connected' : 'Disconnected'}</div>
          <div>Messages Count: {messages.length}</div>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 z-10">
        <div className="space-y-4">
          {messages
            .filter(message => !(!message.isMe && message.userName === "상대방")) // "상대방" 닉네임 메시지 필터링
            .map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex flex-col ${
                  message.isMe ? "items-end" : "items-start"
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

                  {/* 메시지 말풍선 - 내용만 표시 */}
                  <div
                    className={`rounded-xl px-4 py-2 max-w-[100%] ml-auto whitespace-pre-wrap ${
                      message.isMe
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>

                  {/* 메시지 시간 표시 */}
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.isMe ? "text-right" : "text-left"
                  }`}>
                    {formatMessageTime(message.timestamp)}
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
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSendButtonClick}
            disabled={newMessage.trim() === "" || !isConnected}
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