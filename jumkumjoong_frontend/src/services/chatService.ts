// src/services/chatService.ts
import { Client, IMessage } from '@stomp/stompjs';
import { 
  WebSocketMessage, 
  SendWebSocketMessage, 
  ReceiveWebSocketMessage,
  MessageType 
} from '../types/chat';

export interface ChatServiceOptions {
  url: string;
  onConnect?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: WebSocketMessage) => void;
  debug?: boolean;
}

class ChatService {
  private client: Client | null = null;
  private options: ChatServiceOptions;
  private subscriptions: { [key: string]: { id: string } } = {};
  private onConnectCallback: (() => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private onMessageCallback: ((message: WebSocketMessage) => void) | null = null;

  constructor(options: ChatServiceOptions) {
    this.options = options;
    this.onConnectCallback = options.onConnect || null;
    this.onErrorCallback = options.onError || null;
    this.onMessageCallback = options.onMessage || null;
  }

  // 콜백 함수 설정 메서드
  setOnConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  setOnError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }

  setOnMessage(callback: (message: WebSocketMessage) => void): void {
    this.onMessageCallback = callback;
  }

  // 웹소켓 연결 초기화
  connect(): void {
    if (this.client) {
      this.disconnect();
    }

    this.client = new Client({
      brokerURL: this.options.url,
      debug: (str) => {
        if (this.options.debug) {
          console.log('STOMP Debug:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('Connected to STOMP server');
      if (this.onConnectCallback) {
        this.onConnectCallback();
      }
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers, frame.body);
      if (this.onErrorCallback) {
        this.onErrorCallback(frame);
      }
    };

    this.client.activate();
  }

  // 웹소켓 연결 해제
  disconnect(): void {
    if (this.client && this.client.connected) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions = {};
    }
  }

  // 특정 채팅방 구독
  subscribeToRoom(roomId: number): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot subscribe: Client not connected');
      return;
    }

    const destination = `/room/${roomId}`;

    // 이미 구독 중이면 무시
    if (this.subscriptions[destination]) {
      return;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      if (message.body) {
        try {
          const parsedMessage = JSON.parse(message.body) as WebSocketMessage;
          console.log('Received message:', parsedMessage);
          
          if (this.onMessageCallback) {
            this.onMessageCallback(parsedMessage);
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      }
    });

    this.subscriptions[destination] = subscription;
  }

  // 채팅방 구독 해제
  unsubscribeFromRoom(roomId: number): void {
    const destination = `/room/${roomId}`;
    
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].id && 
        this.client?.unsubscribe(this.subscriptions[destination].id);
      delete this.subscriptions[destination];
    }
  }

  // 메시지 전송 (SendWebSocketMessage 또는 ReceiveWebSocketMessage 지원)
  sendMessage(message: SendWebSocketMessage | ReceiveWebSocketMessage): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot send message: Client not connected');
      return;
    }
  
    console.log('Sending message:', message);
    
    const destination = message.type === MessageType.MESSAGE 
      ? `/chat/${message.roomId}` 
      : `/receive/${message.roomId}`;
    
    this.client.publish({
      destination: destination,
      body: JSON.stringify(message)
    });
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return !!this.client && this.client.connected;
  }
}

export default ChatService;