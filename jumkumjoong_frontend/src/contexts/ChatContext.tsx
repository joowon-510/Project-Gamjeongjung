// src/contexts/ChatContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  WebSocketMessage, 
  SendWebSocketMessage, 
  MessageType 
} from '../types/chat';

interface ChatContextType {
  unreadMessageCount: number;
  setUnreadMessageCount: React.Dispatch<React.SetStateAction<number>>;
  lastReceivedMessages: Record<number, SendWebSocketMessage>;
  updateLastReceivedMessage: (roomId: number, message: WebSocketMessage) => void;
  markRoomAsRead: (roomId: number) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [lastReceivedMessages, setLastReceivedMessages] = useState<Record<number, SendWebSocketMessage>>({});
  const [unreadRooms, setUnreadRooms] = useState<Set<number>>(new Set());

  // 새 메시지가 도착했을 때 마지막 메시지 업데이트 및 읽지 않은 메시지 카운트 증가
  const updateLastReceivedMessage = (roomId: number, message: WebSocketMessage) => {
    // 메시지 타입이 MESSAGE인 경우에만 처리
    if (message.type === MessageType.MESSAGE) {
      setLastReceivedMessages(prev => ({
        ...prev,
        [roomId]: message
      }));

      // 현재 화면에 표시되지 않는 채팅방의 메시지인 경우 읽지 않은 메시지로 표시
      if (!unreadRooms.has(roomId)) {
        setUnreadRooms(prev => {
          const newSet = new Set(prev);
          newSet.add(roomId);
          return newSet;
        });
        setUnreadMessageCount(prev => prev + 1);
      }
    }
  };

  // 채팅방을 읽음 상태로 표시
  const markRoomAsRead = (roomId: number) => {
    if (unreadRooms.has(roomId)) {
      setUnreadRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
      });
      // 읽지 않은 메시지 카운트 업데이트
      setUnreadMessageCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <ChatContext.Provider value={{
      unreadMessageCount,
      setUnreadMessageCount,
      lastReceivedMessages,
      updateLastReceivedMessage,
      markRoomAsRead
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