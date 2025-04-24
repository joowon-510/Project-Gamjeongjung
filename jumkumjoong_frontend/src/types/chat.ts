// src/types/chat.ts
export interface Message {
  id: number;
  text: string;
  isMe: boolean;
  userName: string;
  timestamp: string;
}

export interface ChatUser {
  id: number;
  name: string;
}

export interface WebSocketMessage {
  roomId: number;
  sender: number;
  message: string;
  createdAt?: string;
}