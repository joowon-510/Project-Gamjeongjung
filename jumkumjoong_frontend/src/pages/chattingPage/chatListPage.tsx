// src/pages/chattingPage/chatListPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import NavigationBar from "../../components/common/NavigationBar";
import chatting from "../../assets/message-chat.svg";
import ChatItem from "../../components/chat/chatItem";
import axios from 'axios';

// API 임포트
import { deleteChatRoom } from "../../api/chat";

// 상품 관련 인터페이스 임포트
import { GoodsItemDetailProps, GoodsDetailProps } from "../../components/goods/GoodsItem";

// localStorage에 저장할 키
const CHAT_REFRESH_KEY = 'chatListRefresh';
const CHAT_CONTEXT_KEY = 'chatContextInfo';
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// 채팅방 정보 인터페이스
interface ChatRoomItem {
  roomId: string;
  chattingUserNickname: string;
  nonReadCount: number;
  lastMessage: string;
  postTitle: string;
  createdAt?: string;
  lastUpdatedAt?: string;
}

// 로컬에 저장된 컨텍스트 정보
interface ChatContextInfo {
  sellerName: string;
  itemTitle: string;
  createdAt: string;
}

// 통합된 채팅방 정보
interface EnhancedChatRoomItem extends ChatRoomItem {
  sellerNameFromContext?: string;
  itemTitleFromContext?: string;
  isSelected?: boolean;
}

// 페이징 정보 인터페이스
interface PageInfo {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

// 정렬 정보 인터페이스
interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

// 응답 본문 인터페이스
interface ResponseBody {
  content: ChatRoomItem[];
  pageable: PageInfo;
  size: number;
  number: number;
  sort: SortInfo;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// API 응답 인터페이스
interface ApiResponse {
  body: ResponseBody;
  status_code: number;
}

const ChatListPage: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<EnhancedChatRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  // 새로고침 상태를 로컬스토리지 값으로 초기화
  const [refreshTrigger, setRefreshTrigger] = useState<string | null>(
    localStorage.getItem(CHAT_REFRESH_KEY)
  );
  // 선택된 채팅방 상태 추가
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // 로컬 저장 컨텍스트 정보 가져오기
  const getChatContext = (): Record<string, ChatContextInfo> => {
    const contextString = localStorage.getItem(CHAT_CONTEXT_KEY);
    return contextString ? JSON.parse(contextString) : {};
  };

  // 채팅방 목록 로드 함수
  const loadChatRooms = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`채팅방 목록 조회 API 호출 (페이지: ${page})...`);
      const response = await axios.get<ApiResponse>(`${BASE_URL}/chatting?page=${page}&size=10`);
      
      if (response.data && response.data.status_code === 200) {
        console.log('채팅방 목록 조회 성공:', response.data);
        
        const responseBody = response.data.body;
        
        if (responseBody && Array.isArray(responseBody.content)) {
          // 로컬 컨텍스트 정보 가져오기
          const chatContext = getChatContext();
          
          // API 응답 채팅방 목록에 컨텍스트 정보 추가
          const enhancedRooms = responseBody.content.map(room => {
            const contextInfo = chatContext[room.roomId];
            return {
              ...room,
              // contextInfo의 sellerName을 우선적으로 사용, 없으면 API 응답의 chattingUserNickname 사용
              chattingUserNickname: contextInfo?.sellerName || room.chattingUserNickname || '알 수 없음',
              // contextInfo의 itemTitle을 우선적으로 사용, 없으면 API 응답의 postTitle 사용
              postTitle: contextInfo?.itemTitle || room.postTitle || '알 수 없는 상품',
              // 컨텍스트 정보 보존
              sellerNameFromContext: contextInfo?.sellerName,
              itemTitleFromContext: contextInfo?.itemTitle,
              // 초기 선택 상태 false로 설정
              isSelected: room.roomId === selectedRoomId
            };
          });
          
          if (page === 0) {
            // 첫 페이지일 경우 목록 교체
            setChatRooms(enhancedRooms);
          } else {
            // 추가 페이지일 경우 목록에 추가
            setChatRooms(prev => [...prev, ...enhancedRooms]);
          }
          
          // 페이징 정보 업데이트
          setIsLastPage(responseBody.last);
          setPageNumber(responseBody.number);
        } else {
          console.error('채팅방 목록이 없거나 예상치 못한 형식:', responseBody);
          if (page === 0) {
            setChatRooms([]);
          }
        }
      } else {
        console.error('채팅방 목록 조회 실패:', response.data);
        setError("채팅방 목록을 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("채팅방 목록 로딩 오류:", error);
      setError("채팅방 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      
      // API 호출 후 localStorage 키 제거 (다음 방문 시를 위해)
      localStorage.removeItem(CHAT_REFRESH_KEY);
    }
  };

  // 채팅방 삭제 함수
  const handleDeleteChatRoom = async (roomId: string) => {
    try {
      // 채팅방 삭제 API 호출
      const response = await deleteChatRoom(roomId);
      
      if (response && response.status_code === 200) {
        // 성공적으로 삭제된 경우 로컬 상태에서 제거
        setChatRooms(prev => prev.filter(room => room.roomId !== roomId));
        
        // 선택 상태 초기화
        setSelectedRoomId(null);
        
        // localStorage의 채팅 컨텍스트에서도 제거
        const chatContext = getChatContext();
        delete chatContext[roomId];
        localStorage.setItem(CHAT_CONTEXT_KEY, JSON.stringify(chatContext));
      } else {
        console.error('채팅방 삭제 실패:', response);
        alert('채팅방 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error("채팅방 삭제 오류:", error);
      alert('채팅방 삭제 중 오류가 발생했습니다.');
    }
  };

  // 채팅방 선택 핸들러
  const handleSelectChatRoom = (roomId: string) => {
    // 이미 선택된 채팅방이면 선택 해제, 아니면 선택
    setSelectedRoomId(prev => prev === roomId ? null : roomId);
  };

  // 컴포넌트 마운트 시 채팅방 목록 조회
  useEffect(() => {
    loadChatRooms();
  }, [refreshTrigger]); // refreshTrigger가 변경될 때마다 다시 로드

  // 추가 채팅방 로드 함수
  const loadMoreChatRooms = () => {
    if (!isLastPage && !loading) {
      loadChatRooms(pageNumber + 1);
    }
  };

  // 스크롤 이벤트 처리
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // 스크롤이 하단에 도달하면 추가 데이터 로드
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreChatRooms();
    }
  };

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CHAT_REFRESH_KEY && e.newValue) {
        setRefreshTrigger(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <Header title="LOGO" showBackButton={false} hideSearchButton={false} />

      {/* 채팅 목록 타이틀 */}
      <div className="px-4 py-3 border-b">
        <h1 className="text-xl font-bold">채팅</h1>
      </div>

      {/* 채팅 목록 */}
      <div 
        className="flex-1 overflow-y-auto" 
        onScroll={handleScroll}
      >
        {chatRooms.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {chatRooms.map((chat) => (
              <ChatItem
                key={chat.roomId}
                roomId={chat.roomId}
                chattingUserNickname={chat.chattingUserNickname}
                nonReadCount={chat.nonReadCount}
                lastMessage={chat.lastMessage}
                postTitle={chat.postTitle}
                createdAt={chat.createdAt}
                lastUpdatedAt={chat.lastUpdatedAt}
                isSelected={chat.roomId === selectedRoomId}
                onSelect={() => handleSelectChatRoom(chat.roomId)}
                onDelete={() => handleDeleteChatRoom(chat.roomId)}
              />
            ))}
          </ul>
        ) : !loading && !error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>채팅 내역이 없습니다.</p>
          </div>
        ) : null}
        
        {/* 로딩 표시 - 페이지 하단에 표시 */}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {/* 오류 메시지 */}
        {error && (
          <div className="flex justify-center items-center py-4 text-red-500">
            {error}
          </div>
        )}
      </div>

      {/* 하단 네비게이션 바 */}
      <NavigationBar />
    </div>
  );
};

export default ChatListPage;