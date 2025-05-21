// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Message,
  WebSocketMessage,
  SendWebSocketMessage,
  ReceiveWebSocketMessage,
  MessageType,
  ChatHookParams,
} from "../types/chat";
import { useChatService } from "../poviders/ChatServiceProvider";
import { useChatContext } from "../contexts/ChatContext";

export const useChat = ({
  roomId,
  userId,
  recipientName,
  processMessage,
}: ChatHookParams) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const chatService = useChatService();
  const { updateLastReceivedMessage, updateLastAccessTime } = useChatContext();

  // 메시지 ID 생성 함수
  const generateMessageId = useCallback(
    (msg: SendWebSocketMessage | Message): string => {
      if ("id" in msg) return msg.id;
      return `msg_${msg.createdAt}_${msg.sender}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    },
    []
  );

  // 메시지 처리
  const processIncomingMessage = useCallback(
    (websocketMessage: WebSocketMessage) => {
      if (websocketMessage.type === MessageType.MESSAGE) {
        const msgData = websocketMessage as SendWebSocketMessage;
        const messageId = generateMessageId(msgData);

        // 중복 체크
        if (processedMessagesRef.current.has(messageId)) {
          return;
        }

        // 자신의 메시지인지 확인
        if (Number(msgData.sender) === Number(userId)) {
          return;
        }

        processedMessagesRef.current.add(messageId);

        // 메시지 처리
        const newMsg: Message = {
          id: messageId,
          text: msgData.message,
          timestamp: msgData.createdAt,
          isMe: false,
          userName: recipientName,
          read: true,
          receivedAt: msgData.createdAt,
        };

        setMessages((prev) => [...prev, newMsg]);

        // 읽음 확인 전송
        const receiveConfirmation: ReceiveWebSocketMessage = {
          type: MessageType.RECEIVE,
          roomId: websocketMessage.roomId,
          receiver: userId,
          createdAt: new Date().toISOString(),
          receiveAt: new Date().toISOString(),
        };

        chatService.sendMessage(receiveConfirmation);
        updateLastReceivedMessage(roomId, websocketMessage);
      } else if (websocketMessage.type === MessageType.RECEIVE) {
        // 읽음 처리
        const receiveMsg = websocketMessage as ReceiveWebSocketMessage;

        if (Number(receiveMsg.receiver) !== Number(userId)) {
          const receiveTime = new Date(receiveMsg.receiveAt).getTime();

          setMessages((prev) =>
            prev.map((msg) => {
              if (
                msg.isMe &&
                !msg.read &&
                new Date(msg.timestamp).getTime() <= receiveTime
              ) {
                return { ...msg, read: true };
              }
              return msg;
            })
          );
        }
      }
    },
    [
      userId,
      roomId,
      recipientName,
      generateMessageId,
      chatService,
      updateLastReceivedMessage,
    ]
  );

  // 웹소켓 설정
  useEffect(() => {
    let subscriptionRetryTimeout: NodeJS.Timeout;

    const setupWebSocket = () => {
      const handleMessage = (message: WebSocketMessage) => {
        processIncomingMessage(message);
      };

      // 메시지 핸들러 설정
      chatService.setOnMessage(handleMessage);

      // 연결 상태 핸들러
      const handleConnectionChange = () => {
        const connected = chatService.isConnected();
        setIsConnected(connected);

        if (connected) {
          // 연결되면 구독 시도
          const subscription = chatService.subscribeToRoom(roomId);

          if (!subscription) {
            // 구독 실패 시 재시도
            subscriptionRetryTimeout = setTimeout(() => {
              chatService.subscribeToRoom(roomId);
            }, 1000);
          }
        }
      };

      chatService.setOnConnect(handleConnectionChange);
      chatService.setOnError(handleConnectionChange);

      // 초기 연결
      if (!chatService.isConnected()) {
        chatService.connect();
      } else {
        handleConnectionChange();
      }
    };

    setupWebSocket();
    updateLastAccessTime();

    return () => {
      clearTimeout(subscriptionRetryTimeout);
      chatService.unsubscribeFromRoom(roomId);
      chatService.setOnMessage(() => {});
      chatService.setOnConnect(() => {});
      chatService.setOnError(() => {});
    };
  }, [roomId, chatService, processIncomingMessage, updateLastAccessTime]);

  // 메시지 전송
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !isConnected) return;

    const currentTime = new Date().toISOString();
    const messageText = newMessage.trim();

    // 로컬 메시지 추가
    const localMsg: Message = {
      id: generateMessageId({
        createdAt: currentTime,
        sender: userId,
        message: messageText,
        type: MessageType.MESSAGE,
        roomId,
      }),
      text: messageText,
      isMe: true,
      userName: "나",
      timestamp: currentTime,
      read: false,
      receivedAt: currentTime,
    };

    setMessages((prev) => [...prev, localMsg]);

    // 웹소켓으로 전송
    const messageToSend: SendWebSocketMessage = {
      type: MessageType.MESSAGE,
      roomId,
      sender: userId,
      message: messageText,
      createdAt: currentTime,
    };

    chatService.sendMessage(messageToSend);
    setNewMessage("");
  }, [newMessage, roomId, userId, isConnected, chatService, generateMessageId]);

  // 입력 핸들러
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
    },
    []
  );

  // 키 핸들러
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return {
    messages,
    setMessages,
    newMessage,
    isConnected,
    sendMessage,
    handleInputChange,
    handleKeyPress,
    setInitialMessages: setMessages,
    addOlderMessages: (olderMessages: Message[]) => {
      setMessages((prev) => [...olderMessages, ...prev]);
    },
  };
};

export default useChat;
