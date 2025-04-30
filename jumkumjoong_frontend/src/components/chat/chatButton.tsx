// src/components/chat/ChatButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ChatButtonProps {
  sellerId: number;
  itemId: number;
  sellerName: string;
  itemTitle: string;
  className?: string;
}

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// localStorage에 저장할 키
const CHAT_REFRESH_KEY = 'chatListRefresh';
const CHAT_CONTEXT_KEY = 'chatContextInfo'; // 채팅 컨텍스트 정보 저장 키

const ChatButton: React.FC<ChatButtonProps> = ({ 
  sellerId,
  itemId,
  sellerName,
  itemTitle,
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChatStart = async () => {
    try {
      setLoading(true);
      
      // 채팅방 생성 API 호출
      const response = await axios.post(
        `${BASE_URL}/chatting`, 
        { 
          sellerId, 
          itemId 
        }
      );
      
      // 응답 확인
      if (response.data && response.data.status_code === 200) {
        console.log('채팅방 생성 성공!', response.data);
        
        // 채팅 컨텍스트 정보 저장 (판매자 이름과 상품 제목)
        // 이미 저장된 정보가 있으면 확장
        const existingContextString = localStorage.getItem(CHAT_CONTEXT_KEY);
        const existingContext = existingContextString ? JSON.parse(existingContextString) : {};
        
        // 가능하다면 응답에서 roomId 추출, 없으면 임시 ID 사용
        // 백엔드에서 응답으로 roomId를 제공하지 않는 경우를 위한 임시 방편
        let chatRoomId;
        if (response.data.body && response.data.body.roomId) {
          chatRoomId = response.data.body.roomId;
        } else {
          // 임시 ID - 실제로는 백엔드가 roomId를 반환해야 함
          chatRoomId = `${sellerId}_${itemId}_${Date.now()}`;
        }
        
        // 채팅 컨텍스트 정보 업데이트
        const updatedContext = {
          ...existingContext,
          [chatRoomId]: {
            sellerName,
            itemTitle,
            createdAt: new Date().toISOString()
          }
        };
        
        localStorage.setItem(CHAT_CONTEXT_KEY, JSON.stringify(updatedContext));
        
        // 채팅 목록 페이지가 새로고침되도록 localStorage에 상태 저장
        localStorage.setItem(CHAT_REFRESH_KEY, Date.now().toString());
        
        // 채팅 목록 페이지로 이동
        navigate('/chat/list');
      } else {
        console.error('채팅방 생성 실패:', response.data);
        alert('채팅방을 생성할 수 없습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('채팅 시작 중 오류 발생:', error);
      
      // axios 오류 처리
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/login');
          return;
        }
      }
      
      alert('채팅 기능을 이용할 수 없습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleChatStart}
      disabled={loading}
      className={`px-6 py-2 bg-blue-400 text-white font-medium rounded-md hover:bg-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>처리 중...</span>
        </div>
      ) : `${sellerName}님과 채팅하기`}
    </button>
  );
};

export default ChatButton;