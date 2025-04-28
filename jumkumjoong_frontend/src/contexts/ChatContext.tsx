// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  WebSocketMessage, 
  SendWebSocketMessage, 
  MessageType,
  Message
} from '../types/chat';

interface ChatContextType {
  unreadMessageCount: number;
  lastAccessTime: Date | null;
  updateLastAccessTime: () => void;
  unreadMessagesByRoom: Record<number, number>;
  lastReceivedMessages: Record<number, SendWebSocketMessage>;
  updateLastReceivedMessage: (roomId: number, message: WebSocketMessage) => void;
  markRoomAsRead: (roomId: number) => void;
  processIncomingMessage: (message: SendWebSocketMessage) => Message;
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [lastAccessTime, setLastAccessTime] = useState<Date | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [unreadMessagesByRoom, setUnreadMessagesByRoom] = useState<Record<number, number>>({});
  const [lastReceivedMessages, setLastReceivedMessages] = useState<Record<number, SendWebSocketMessage>>({});

  // 앱 로드 시 마지막 접속 시간 복원
  useEffect(() => {
    const storedLastAccessTime = localStorage.getItem('lastAccessTime');
    if (storedLastAccessTime) {
      setLastAccessTime(new Date(storedLastAccessTime));
    } else {
      updateLastAccessTime();
    }
  }, []);

  // 마지막 접속 시간 업데이트
  const updateLastAccessTime = useCallback(() => {
    const currentTime = new Date();
    setLastAccessTime(currentTime);
    localStorage.setItem('lastAccessTime', currentTime.toISOString());
  }, []);

  // 받은 메시지를 처리하여 Message 객체로 변환
  const processIncomingMessage = useCallback((message: SendWebSocketMessage): Message => {
    return {
      id: Date.now(), // 임시 ID, 실제 백엔드 ID로 대체 가능
      text: message.message,
      isMe: false,
      userName: '', // 발신자 이름은 별도로 처리 필요
      timestamp: message.createdAt,
      read: false, // 기본적으로 읽지 않은 상태로 설정
      receivedAt: message.createdAt
    };
  }, []);

  // 새 메시지가 도착했을 때 마지막 메시지 업데이트 및 읽지 않은 메시지 카운트 증가
  const updateLastReceivedMessage = useCallback((roomId: number, message: WebSocketMessage) => {
    // 메시지 타입이 MESSAGE인 경우에만 처리
    if (message.type === MessageType.MESSAGE) {
      setLastReceivedMessages(prev => ({
        ...prev,
        [roomId]: message
      }));

      // 해당 방의 읽지 않은 메시지 수 증가
      setUnreadMessagesByRoom(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || 0) + 1
      }));

      // 전체 읽지 않은 메시지 수 증가
      setUnreadMessageCount(prev => prev + 1);
    }
  }, []);

  // 채팅방을 읽음 상태로 표시
  const markRoomAsRead = useCallback((roomId: number) => {
    if (unreadMessagesByRoom[roomId]) {
      // 해당 방의 읽지 않은 메시지 수를 0으로 설정
      setUnreadMessagesByRoom(prev => {
        const newUnreadMessages = {...prev};
        const unreadCount = newUnreadMessages[roomId] || 0;
        delete newUnreadMessages[roomId];
        
        // 전체 읽지 않은 메시지 수 감소
        setUnreadMessageCount(prev => Math.max(0, prev - unreadCount));
        
        return newUnreadMessages;
      });
    }
  }, [unreadMessagesByRoom]);

  return (
    <ChatContext.Provider value={{
      unreadMessageCount,
      lastAccessTime,
      updateLastAccessTime,
      unreadMessagesByRoom,
      lastReceivedMessages,
      updateLastReceivedMessage,
      markRoomAsRead,
      processIncomingMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};