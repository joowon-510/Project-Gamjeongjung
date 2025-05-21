// src/services/chatService.ts
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import {
  WebSocketMessage,
  SendWebSocketMessage,
  ReceiveWebSocketMessage,
} from "../types/chat";
import { useAuthStore } from "../stores/useUserStore";

export interface ChatServiceOptions {
  url: string;
  onConnect?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onStateChange?: (connected: boolean) => void;
  debug?: boolean;
}

class ChatService {
  private client: Client | null = null;
  private options: ChatServiceOptions;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private pendingSubscriptions: Set<string> = new Set();
  private connectionState: "disconnected" | "connecting" | "connected" =
    "disconnected";
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // 콜백 핸들러들
  private onConnectCallback: (() => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private onMessageCallback: ((message: WebSocketMessage) => void) | null =
    null;

  constructor(options: ChatServiceOptions) {
    this.options = options;
    this.onConnectCallback = options.onConnect || null;
    this.onErrorCallback = options.onError || null;
    this.onMessageCallback = options.onMessage || null;
  }

  // 콜백 설정 메서드들
  setOnConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  setOnError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }

  setOnMessage(callback: (message: WebSocketMessage) => void): void {
    this.onMessageCallback = callback;
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.connectionState === "connected" && !!this.client?.connected;
  }

  // 토큰 가져오기
  private getToken(): string | null {
    const authStore = useAuthStore.getState();
    return authStore.accessToken || localStorage.getItem("accessToken");
  }

  // 연결 시작
  async connect(): Promise<void> {
    // 이미 연결 중이거나 연결됨
    if (this.connectionState !== "disconnected") {
      // 이미 연결된 상태라면 콜백 실행
      if (this.connectionState === "connected" && this.client?.connected) {
        this.onConnectCallback?.();
        this.options.onConnect?.();
      }
      return;
    }

    const token = this.getToken();
    if (!token) {
      this.onErrorCallback?.(new Error("No authentication token"));
      return;
    }

    this.connectionState = "connecting";
    this.options.onStateChange?.(false);

    try {
      // 이미 클라이언트가 존재하면 재사용
      if (this.client) {
        await this.client.activate();
        return;
      }

      this.client = new Client({
        brokerURL: this.options.url,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (this.options.debug) {
          }
        },
        reconnectDelay: 5000, // 재연결 딜레이 5초
        heartbeatIncoming: 0, // 하트비트 완전 비활성화
        heartbeatOutgoing: 0, // 하트비트 완전 비활성화
      });

      this.setupEventHandlers();

      await this.client.activate();
    } catch (error) {
      this.connectionState = "disconnected";
      this.scheduleReconnect();
    }
  }

  // 이벤트 핸들러 설정
  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.onConnect = () => {
      this.connectionState = "connected";
      this.reconnectAttempts = 0;

      // 상태 변경 알림
      this.options.onStateChange?.(true);

      // 콜백 실행
      this.onConnectCallback?.();
      this.options.onConnect?.();

      // 대기 중인 구독 처리
      this.processPendingSubscriptions();
    };

    this.client.onStompError = (frame) => {
      this.handleError(frame);
    };

    this.client.onWebSocketClose = (event) => {
      this.handleDisconnection(event);
    };
  }

  // 에러 처리 메서드
  private handleError(error: any): void {
    // 하트비트 관련 에러는 무시
    if (
      error?.headers?.message?.includes(
        "Failed to send message to ExecutorSubscribableChannel"
      )
    ) {
      return;
    }

    // 프로토콜 버전 불일치 에러
    if (error?.headers?.message?.includes("protocol")) {
      return;
    }

    this.onErrorCallback?.(error);
    this.options.onError?.(error);

    // 인증 에러인 경우 재연결 시도하지 않음
    if (
      error?.headers?.message?.includes("Authentication") ||
      error?.headers?.message?.includes("Unauthorized")
    ) {
      this.connectionState = "disconnected";
      this.options.onStateChange?.(false);
      return;
    }
  }

  // 연결 해제 처리
  private handleDisconnection(event: CloseEvent): void {
    this.connectionState = "disconnected";
    this.options.onStateChange?.(false);

    // 정상적인 종료가 아닌 경우에만 재연결 시도
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  // 재연결 스케줄링
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onErrorCallback?.(new Error("Max reconnect attempts exceeded"));
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    // 지수 백오프 전략 사용 (1초, 2초, 4초, 8초, 16초)
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts - 1),
      16000
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // 구독
  subscribeToRoom(roomId: string): StompSubscription | null {
    if (!this.isConnected()) {
      this.pendingSubscriptions.add(roomId);
      return null;
    }

    const destination = `/receive/${roomId}`;

    // 이미 구독 중인지 확인
    if (this.subscriptions.has(destination)) {
      return this.subscriptions.get(destination)!;
    }

    try {
      const subscription = this.client!.subscribe(
        destination,
        (message: IMessage) => this.handleMessage(message),
        {
          id: `sub-${roomId}`, // 구독 ID 추가
        }
      );

      this.subscriptions.set(destination, subscription);
      this.pendingSubscriptions.delete(roomId);

      return subscription;
    } catch (error) {
      this.pendingSubscriptions.add(roomId);
      return null;
    }
  }

  // 메시지 처리 메서드
  private handleMessage(message: IMessage): void {
    if (!message.body) return;

    try {
      const parsedMessage = JSON.parse(message.body) as WebSocketMessage;

      // 메시지 콜백 실행
      this.onMessageCallback?.(parsedMessage);
      this.options.onMessage?.(parsedMessage);
    } catch (error) {}
  }

  // 대기 중인 구독 처리
  private processPendingSubscriptions(): void {
    this.pendingSubscriptions.forEach((roomId) => {
      this.subscribeToRoom(roomId);
    });
  }

  // 구독 해제
  unsubscribeFromRoom(roomId: string): void {
    const destination = `/receive/${roomId}`;
    const subscription = this.subscriptions.get(destination);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  // 메시지 전송
  sendMessage(
    message: SendWebSocketMessage | ReceiveWebSocketMessage
  ): boolean {
    if (!this.isConnected()) {
      return false;
    }

    try {
      const destination = `/send/${message.roomId}`;

      this.client!.publish({
        destination,
        body: JSON.stringify(message),
        headers: {
          "content-type": "application/json",
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // 연결 해제
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 모든 구독 해제
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.pendingSubscriptions.clear();

    if (this.client) {
      this.connectionState = "disconnected";
      this.options.onStateChange?.(false);
      this.client.deactivate();
      this.client = null;
    }
  }

  // 연결 상태 가져오기
  getConnectionState(): "disconnected" | "connecting" | "connected" {
    return this.connectionState;
  }
}

export default ChatService;
