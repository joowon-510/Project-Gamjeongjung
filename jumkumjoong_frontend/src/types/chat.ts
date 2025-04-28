// src/types/chat.ts
export enum MessageType {
  MESSAGE = 'MESSAGE',
  RECEIVE = 'RECEIVE'
}

export interface BaseWebSocketMessage {
  type: MessageType;
  roomId: number;
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

export interface ChatUser {
  id: number;
  name: string;
}

export interface Message {
  id: number;
  text: string;
  isMe: boolean;
  userName: string;
  timestamp: string;
  read: boolean;
  receivedAt: string; // 메시지 수신 시간 추가
}

export type WebSocketMessage = SendWebSocketMessage | ReceiveWebSocketMessage;