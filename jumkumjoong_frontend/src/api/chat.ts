// src/api/chat.ts
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// 채팅방 생성 요청 타입
interface CreateChatRoomRequest {
  sellerId: number;
  itemId: number;
}

export interface Message {
  id: string;  // Changed from number to string to match API response
  text: string;
  timestamp: string;
  isMe: boolean;
  userName: string;
  read?: boolean;
  receivedAt?: string;
}

export interface ChatUser {
  id: number;
  name: string;
}

export interface ChatHookParams {
  roomId: number;  // Keep as number for internal use
  userId: number;
  recipientName: string;
}

// 채팅방 생성 응답 타입
export interface ChatResponse<T = any> {
  body: T;
  status_code: number;
}

// 채팅방 정보 타입
export interface ChatRoom {
  // 기본 식별자
  id?: number;
  roomId: number;
  
  // 사용자 관련 정보
  sellerId?: number;
  buyerId?: number;
  sellerName?: string;
  buyerName?: string;
  
  // 상품 관련 정보
  itemId?: number;
  itemName?: string;
  itemPrice?: number;
  itemStatus?: boolean;
  itemDescription?: string;
  itemCategory?: string;
  
  // 시간 관련 정보
  createdAt?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  updatedAt?: string;
  
  // 채팅방 상태 관련 정보
  isDeleted?: boolean;
  nonReadCount?: number;
  
  // 참여자 정보
  participants?: {
    userId: number;
    nickname: string;
    profileImage?: string;
  }[];
  
  // 거래 관련 정보
  tradeStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  
  // 채팅 메타데이터
  totalMessageCount?: number;
  lastMessageType?: 'TEXT' | 'IMAGE' | 'FILE';
  
  // 추가 메타데이터
  isBlocked?: boolean;
  blockedBy?: number;
  
  // 기타 필요한 필드
  extras?: {
    [key: string]: any;
  };
}

export interface ChatMessageResponse {
  body: {
    roomId: string; // roomId를 string으로 변경
    messages: ChatMessage[];
    participant: {
      userId: number;
      nickname: string;
    };
  };
  status_code: number;
}

export interface ChatRouteState {
  chattingUserNickname?: string;
}

export interface ChatMessage {
  messageId: string;
  text: string;
  senderId: number;
  timestamp: string;
  isRead: boolean;
}

// 채팅방 생성
export const createChatRoom = async (data: CreateChatRoomRequest) => {
  try {
    const response = await axios.get<ChatResponse<ChatRoom>>(`${BASE_URL}/chatting`, { params: data });
    return response.data;
  } catch (error) {
    console.error('채팅방 생성 오류:', error);
    throw error;
  }
};

// 채팅방 목록 조회
export const getChatRooms = async () => {
  try {
    const response = await axios.get<ChatResponse<ChatRoom[]>>(`${BASE_URL}/chatting`);
    return response.data;
  } catch (error) {
    console.error('채팅방 목록 조회 오류:', error);
    throw error;
  }
};

// 특정 채팅방의 메시지 조회
export const getChatMessages = async (roomId: string) => {
  try {
    const response = await axios.get<ChatMessageResponse>(`${BASE_URL}/chatting/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('채팅 메시지 조회 오류:', error);
    throw error;
  }
};

// 채팅방 삭제
export const deleteChatRoom = async (roomId: string) => {
  try {
    const response = await axios.delete<ChatResponse>(`${BASE_URL}/chatting/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('채팅방 삭제 오류:', error);
    throw error;
  }
};