// src/pages/chattingPage/chatPage.tsx - 디버깅 코드 추가된 버전
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import nologo from "../../assets/nologo.svg";
import useChat from "../../hooks/useChat";
import { 
  ChatUser, 
  Message, 
  ChatRouteState, 
  ChatMessageParams, 
  ChatMessageDTO,
  WebSocketMessage,
  MessageType,
  SendWebSocketMessage,
  ReceiveWebSocketMessage
} from '../../types/chat';
import { getChatMessages, getUserChatInfo } from '../../api/chat';
import { useChatContext } from "../../contexts/ChatContext";
import { format, isToday, isYesterday } from 'date-fns';

const ChatPage: React.FC = () => {
const { chatid } = useParams<{ chatid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<ChatUser | null>(() => {
    // 1. location.state에서 chattingUserNickname 확인 (최우선)
    const stateNickname = location.state?.chattingUserNickname;
    
    // 2. localStorage에서 nickname 확인 (두번째 우선순위)
    const storedNickname = localStorage.getItem('currentChatUserNickname');
    
    console.log('🔍 ChatPage 닉네임 데이터 확인:', {
      stateNickname,
      storedNickname,
      locationState: location.state,
      allLocalStorage: Object.keys(localStorage).map(key => ({
        key,
        value: localStorage.getItem(key)
      }))
    });
    
    // 닉네임 결정 (우선순위: state > localStorage > 기본값)
    const finalNickname = stateNickname || storedNickname || '채팅 상대';
    console.log('✅ 최종 사용할 닉네임:', finalNickname);
    
    return {
      id: 0, // ID는 API 응답에서 업데이트 예정
      name: finalNickname
    };
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 페이지네이션 관련 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [oldScrollHeight, setOldScrollHeight] = useState<number>(0);
  
  // 사용자 ID 상태 추가
  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    // 로컬 스토리지에서 userId 초기값 설정
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });
  
  // API 디버깅을 위한 상태 추가
  const [apiStatus, setApiStatus] = useState<string>('아직 API 호출 전');
  const [manualFetchResult, setManualFetchResult] = useState<string>('');

  // ChatContext 사용 (읽음 표시를 위해)
  const { markRoomAsRead } = useChatContext();
  
  const [roomId, setRoomId] = useState<string>(() => {
    // 1. URL 파라미터에서 roomId 확인 (최우선) - chatid는 항상 있어야 함
    const urlRoomId = chatid;
    
    // 2. location state에서 roomId 확인
    const stateRoomId = location.state?.roomId;
    
    // 3. localStorage에서 roomId 확인
    const storedRoomId = localStorage.getItem('currentRoomId');
    
    console.log('🔍 ChatPage 마운트 시 roomId 설정:', {
      urlRoomId,
      stateRoomId,
      storedRoomId
    });
    
    // 우선순위 순서: URL > state > localStorage
    let finalRoomId = '';
    
    if (urlRoomId) {
      console.log('✅ URL 파라미터에서 roomId 사용:', urlRoomId);
      finalRoomId = urlRoomId;
    } else if (stateRoomId) {
      console.log('✅ location.state에서 roomId 사용:', stateRoomId);
      finalRoomId = stateRoomId;
    } else if (storedRoomId) {
      console.log('✅ localStorage에서 roomId 사용:', storedRoomId);
      finalRoomId = storedRoomId;
    } else {
      console.error('❌ roomId를 찾을 수 없음! 채팅 목록으로 리다이렉트합니다.');
      // 비동기로 리다이렉트 처리
      setTimeout(() => { navigate('/chatting'); }, 100);
    }
    
    // 최종 선택된 roomId를 localStorage에 저장
    if (finalRoomId) {
      localStorage.setItem('currentRoomId', finalRoomId);
    }
    
    return finalRoomId;
  });
  
  // 사용자 ID 가져오기 - 향상된 디버깅
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await getUserChatInfo();
        // 성공 시 로컬 스토리지에 저장 (아래 2번 참조)
      } catch (error) {
        console.error("사용자 ID 요청 실패:", error);
      }
    };
    fetchUserId(); // 조건문 제거 → 무조건 실행
  }, []);

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
  
  // 사용자 ID 수동 테스트 함수
  const manualFetchUserId = async () => {
    try {
      setApiStatus('수동 API 호출 시작...');
      const response = await getUserChatInfo();
      console.log('수동 API 호출 결과:', response);
      setApiStatus(`수동 API 호출 결과: ${JSON.stringify(response)}`);
    } catch (error) {
      console.error('수동 API 호출 오류:', error);
      setApiStatus(`수동 API 호출 오류: ${error}`);
    }
  };
  
  // 웹소켓 메시지 처리 함수 - currentUserId와 비교하여 내 메시지인지 판단
  const processWebSocketMessage = (message: WebSocketMessage): Message | null => {
    if (message.type === MessageType.MESSAGE) {
      const messageData = message as SendWebSocketMessage;
      
      const isMyMessage = messageData.sender === currentUserId;
      
      // user?.name을 우선적으로 사용하고, 없거나 '상대방'인 경우 location.state에서 가져옴
      const recipientName = user?.name && user.name !== "상대방" && user.name !== "채팅 상대" 
        ? user.name 
        : location.state?.chattingUserNickname || localStorage.getItem('currentChatUserNickname') || "채팅 상대";
      
      return {
        id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        text: messageData.message,
        timestamp: messageData.createdAt,
        isMe: isMyMessage,
        userName: isMyMessage ? '나' : recipientName,
        read: isMyMessage,
        receivedAt: messageData.createdAt
      };
    }
    
    return null;
  };

  // useChat 훅 사용 - currentUserId가 변경될 때 다시 초기화하고 processWebSocketMessage 함수 전달
  const {
    messages,
    newMessage,
    isConnected,
    sendMessage,
    handleInputChange,
    handleKeyPress,
    setInitialMessages,
    addOlderMessages
  } = useChat({
    roomId: roomId || '', // null인 경우 빈 문자열 전달
    userId: currentUserId ?? 0, // null일 경우 0 사용
    recipientName: user?.name || "",
    processMessage: processWebSocketMessage
  });

  // DTO를 클라이언트 메시지 형식으로 변환하는 함수
  const convertToClientMessage = (dto: ChatMessageDTO): Message => {
    // 메시지 발신자가 현재 사용자인지 확인
    // senderId가 있으면 그걸 사용하고, 없으면 toSend 필드로 판단
    const isMe = dto.senderId !== undefined 
      ? dto.senderId === currentUserId 
      : dto.toSend === true;
      
    // 상대방 닉네임 설정 - 우선순위: user?.name > location.state > localStorage
    const recipientName = user?.name && user.name !== "상대방" && user.name !== "채팅 상대"
      ? user.name
      : location.state?.chattingUserNickname || localStorage.getItem('currentChatUserNickname') || "채팅 상대";
    
    return {
      id: `msg_${new Date(dto.createdAt).getTime()}_${Math.random().toString(36).substring(2, 9)}`,
      text: dto.message || '',
      timestamp: dto.createdAt,
      isMe: isMe,
      userName: isMe ? '나' : recipientName,
      read: true, // 기본적으로 읽은 상태로 설정
      receivedAt: dto.createdAt
    };
  };

  // 이전 메시지 불러오기 함수
  const loadMessages = async (isInitialLoad = false) => {
    if (isLoading || (!hasMore && !isInitialLoad)) return;
    
    setIsLoading(true);
    
    try {
      // 페이지네이션 파라미터 설정
      const params: ChatMessageParams = {
        page: isInitialLoad ? 0 : currentPage + 1,  // 초기 로드는 0페이지, 이후는 다음 페이지
        size: 20,                                   // 한 번에 가져올 메시지 수
        sort: 'createdAt,desc'                      // 최신 메시지부터 정렬
      };
      
      // API 호출
      const response = await getChatMessages(roomId, params);
      
      // API 응답 확인 및 안전한 접근
      if (response && 
          response.status_code === 200 && 
          response.body && 
          response.body.content && 
          Array.isArray(response.body.content)) {
          
        // 닉네임 추출 - location.state에서 chattingUserNickname을 우선적으로 사용
        const chattingUserNickname = location.state?.chattingUserNickname || 
          (chatid === "1" ? "AI의 신예훈" : 
           chatid === "2" ? "재드래곤" : 
           "맥북헤이터");
        
        // 채팅 상대방 정보 설정
        if (isInitialLoad && response.body.otherParticipant) {
          // API 응답에서 받은 상대방 정보로 user 업데이트
          const apiNickname = response.body.otherParticipant.nickname;
          console.log('📱 API에서 받은 상대방 닉네임:', apiNickname);
          
          // API 응답의 닉네임을 우선 사용하고, localStorage 값을 다시 업데이트
          setUser({
            id: response.body.otherParticipant.userId,
            name: apiNickname || location.state?.chattingUserNickname || '상대방'
          });
          
          // API에서 받은 닉네임으로 localStorage 업데이트
          if (apiNickname) {
            console.log('🔄 localStorage의 닉네임 업데이트:', apiNickname);
            localStorage.setItem('currentChatUserNickname', apiNickname);
          }
        }
        
        // DTO를 클라이언트 메시지 형식으로 변환
        const formattedMessages: Message[] = response.body.content.map((dto: ChatMessageDTO) => 
          convertToClientMessage(dto)
        );
        
        // 더 불러올 메시지가 있는지 확인 (last 필드로 판단)
        setHasMore(!response.body.last && formattedMessages.length > 0);
        
        // 다음 페이지 번호 업데이트
        if (!isInitialLoad) {
          setCurrentPage(response.body.number);
        }
        
        // 메시지가 있는 경우만 처리
        if (formattedMessages.length > 0) {
          // 시간 역순으로 정렬된 메시지를 시간순으로 재정렬 (필요한 경우)
          const timeOrderedMessages = [...formattedMessages].reverse();
          
          if (isInitialLoad) {
            // 초기 로드인 경우 메시지 설정
            setInitialMessages(timeOrderedMessages);
          } else {
            // 이전 메시지 로드인 경우 스크롤 위치 저장
            if (messagesContainerRef.current) {
              setOldScrollHeight(messagesContainerRef.current.scrollHeight);
            }
            
            // 이전 메시지 추가
            addOlderMessages(timeOrderedMessages);
          }
        } else {
          // 메시지가 없으면 더 불러올 메시지가 없음
          setHasMore(false);
        }
        
        // 초기 로드인 경우 사용자 정보 설정
        if (isInitialLoad && user === null && !response.body.otherParticipant) {
          setUser({
            id: 0,
            name: chattingUserNickname
          });
        }
      } else {
        console.log('API 응답 형식이 예상과 다릅니다:', response);
        // API 응답이 정상이 아닌 경우
        setHasMore(false);
        
        if (isInitialLoad) {
          // 빈 메시지 배열 설정
          setInitialMessages([]);
          
          // 닉네임 설정
          const chattingUserNickname = location.state?.chattingUserNickname || 
            (chatid === "1" ? "AI의 신예훈" : 
             chatid === "2" ? "재드래곤" : 
             "맥북헤이터");
          
          // 기본 사용자 정보 설정
          setUser({
            id: 0,
            name: chattingUserNickname
          });
        }
      }
    } catch (error) {
      console.error('채팅 메시지 로드 오류:', error);
      setHasMore(false);
      
      if (isInitialLoad) {
        // 빈 메시지 배열 설정
        setInitialMessages([]);
        
        // 닉네임 설정
        const chattingUserNickname = location.state?.chattingUserNickname || 
          (chatid === "1" ? "AI의 신예훈" : 
           chatid === "2" ? "재드래곤" : 
           "맥북헤이터");
        
        // 오류 발생 시 기본 사용자 정보 설정
        setUser({
          id: 0,
          name: chattingUserNickname
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 채팅방 초기 데이터 로드 - userId가 로드된 후에 실행
  useEffect(() => {
    if (currentUserId) {
      loadMessages(true);
    }
  }, [chatid, location.state, currentUserId]); // currentUserId 의존성 추가

  // 스크롤 위치 관련 처리 (이전 메시지 로드 후)
  useEffect(() => {
    if (oldScrollHeight > 0 && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - oldScrollHeight;
      messagesContainerRef.current.scrollTop = scrollDiff;
      
      // 스크롤 위치 조정 후 상태 초기화
      setOldScrollHeight(0);
    }
  }, [messages, oldScrollHeight]);

  // 채팅방에 들어왔을 때 읽음 표시 처리
  useEffect(() => {
    if (isConnected && roomId) {
      markRoomAsRead(roomId);
    }
  }, [isConnected, roomId, markRoomAsRead]);

  // 메시지 목록이 업데이트될 때 스크롤을 맨 아래로 이동 (초기 로드 또는 새 메시지 수신 시)
  useEffect(() => {
    // 이전 메시지 로드 중이 아닐 때만 스크롤 아래로 이동
    if (!oldScrollHeight) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    window.history.back();
  };

  // 메시지 전송 버튼 핸들러
  const handleSendButtonClick = () => {
    console.log('Sending message:', newMessage);
    sendMessage();
    // 스크롤을 아래로 내림
    setTimeout(scrollToBottom, 100);
  };

  // 이전 메시지 더 불러오기 버튼 핸들러
  const handleLoadMoreMessages = () => {
    if (!isLoading && hasMore) {
      loadMessages(false);
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
          <div>Has More: {hasMore ? 'Yes' : 'No'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Current Page: {currentPage}</div>
          <div className="mt-2 font-bold">API 상태: {apiStatus}</div>
          <div className="mt-1">직접 fetch 결과: {manualFetchResult}</div>
          <button 
            onClick={manualFetchUserId}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
          >
            사용자 ID 수동 조회
          </button>
        </div>
      )}

      {/* 메시지 목록 */}
      <div 
        className="flex-1 overflow-y-auto p-4 z-10"
        ref={messagesContainerRef}
        onScroll={(e) => {
          // 스크롤이 상단에 가까워지면 이전 메시지 로드
          const { scrollTop } = e.currentTarget;
          if (scrollTop < 50 && hasMore && !isLoading) {
            handleLoadMoreMessages();
          }
        }}
      >
        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-blue-500 border-r-transparent"></div>
            <p className="text-sm text-gray-500 mt-1">이전 메시지 불러오는 중...</p>
          </div>
        )}
        
        {/* 더 불러오기 버튼 */}
        {hasMore && !isLoading && messages.length > 0 && (
          <div className="text-center mb-4">
            <button 
              onClick={handleLoadMoreMessages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
            >
              이전 메시지 더 불러오기
            </button>
          </div>
        )}

        <div className="space-y-4">
          {messages
            // Remove this filter entirely - don't filter out any messages
            // .filter(message => !(!message.isMe && message.userName === "상대방"))
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
                    {user?.name || message.userName}
                  </div>
                )}

                {/* 메시지 말풍선 */}
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