// src/types/chat.ts
export enum MessageType {
  MESSAGE = 'MESSAGE',
  RECEIVE = 'RECEIVE',
  READ = 'READ',
  TYPING = 'TYPING'
}

export interface BaseWebSocketMessage {
  type: MessageType;
  roomId: string;
  createdAt: string;
}

export interface SendWebSocketMessage extends BaseWebSocketMessage {
  type: MessageType.MESSAGE;
  sender: number;
  message: string;
}

export interface ReceiveWebSocketMessage extends BaseWebSocketMessage {
  type: MessageType.RECEIVE;
  receiver: number;
  receiveAt: string;
}

// 읽음 확인 웹소켓 메시지 (필요시 사용)
export interface ReadWebSocketMessage extends BaseWebSocketMessage {
  type: MessageType.READ;
  reader: number;
  readAt: string;
}

// 타이핑 상태 웹소켓 메시지 (필요시 사용)
export interface TypingWebSocketMessage extends BaseWebSocketMessage {
  type: MessageType.TYPING;
  userId: number;
  isTyping: boolean;
}

export interface ChatUser {
  id: number;
  name: string;
}

export interface Message {
  id: string;  // number에서 string으로 변경 (API 응답과 일치)
  text: string;
  isMe: boolean;
  userName: string;
  timestamp: string;
  read: boolean;
  receivedAt: string;
}

// 유니온 타입으로 모든 웹소켓 메시지 타입 정의
export type WebSocketMessage = SendWebSocketMessage | ReceiveWebSocketMessage | ReadWebSocketMessage | TypingWebSocketMessage;

// API 관련 인터페이스
export interface ChatHookParams {
  roomId: string;
  userId: number;
  recipientName: string;
}

export interface ChatMessage {
  messageId?: string;
  text?: string;
  senderId?: number;
  timestamp?: string;
  isRead?: boolean;
  // 새로운 API 응답 구조에 맞는 필드 추가
  toSend?: boolean;
  message?: string;
  createdAt?: string;
}

export interface ChatMessageResponse {
  body: {
    roomId: string;
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

// 채팅방 정보 타입
export interface ChatRoom {
  roomId: string;
  participants?: {
    userId: number;
    nickname: string;
    profileImage?: string;
  }[];
  lastMessage?: string;
  lastMessageTime?: string;
  nonReadCount?: number;
}