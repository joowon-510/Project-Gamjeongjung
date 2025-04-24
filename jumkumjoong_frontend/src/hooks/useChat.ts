// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import { Message, WebSocketMessage } from '../types/chat';
import { useChatService } from '../poviders/ChatServiceProvider'; // 경로 수정됨
import { getCurrentTime } from '../utils/chatUtils';
import { useChatContext } from '../contexts/ChatContext';

interface UseChatOptions {
  roomId: number;
  userId: number;
  recipientName: string;
}

export const useChat = ({ roomId, userId, recipientName }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<WebSocketMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // 글로벌 ChatService 인스턴스 사용
  const chatService = useChatService();
  
  // ChatContext 사용
  const chatContext = useChatContext();

  // 웹소켓 연결 및 채팅방 구독
  useEffect(() => {
    console.log('useEffect: 웹소켓 설정 시작', roomId, userId);
    
    // 연결 상태 업데이트
    const handleConnectionChange = () => {
      setIsConnected(chatService.isConnected());
      console.log('연결 상태 변경:', chatService.isConnected());
    };

    // 메시지 수신 핸들러
    const handleMessage = (message: WebSocketMessage) => {
      console.log('메시지 수신 핸들러 실행:', message);
      
      // 중복 메시지 체크 - 이미 받은 메시지인지 확인
      const isDuplicate = receivedMessages.some(
        (msg) => msg.sender === message.sender && msg.message === message.message
      );
      
      if (isDuplicate) {
        console.log('중복 메시지 무시:', message);
        return;
      }
      
      // 수신된 메시지 저장
      setReceivedMessages(prev => {
        console.log('이전 수신 메시지:', prev);
        return [...prev, message];
      });

      // 자신이 보낸 메시지면 무시 (이미 UI에 표시됨)
      if (message.sender === userId) {
        console.log('자신이 보낸 메시지 무시');
        return;
      }
      
      // 상대방 메시지만 UI에 추가
      const newMsg: Message = {
        id: Date.now(),
        text: message.message,
        isMe: false,
        userName: recipientName,
        timestamp: getCurrentTime(),
      };
      
      console.log('UI에 메시지 추가:', newMsg);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, newMsg];
        console.log('업데이트된 메시지 배열:', updatedMessages);
        return updatedMessages;
      });
    };

    // 웹소켓 연결 및 구독 설정
    if (!chatService.isConnected()) {
      console.log('웹소켓 연결 시작');
      chatService.connect();
    }

    setIsConnected(chatService.isConnected());
    console.log('초기 연결 상태:', chatService.isConnected());

    // 이벤트 리스너 등록
    const onConnectHandler = () => {
      console.log('연결 성공 이벤트');
      handleConnectionChange();
      chatService.subscribeToRoom(roomId);
      console.log('채팅방 구독:', roomId);
    };

    // 이벤트 핸들러 설정
    chatService.setOnConnect(onConnectHandler);
    chatService.setOnError(() => {
      console.log('연결 오류 발생');
      handleConnectionChange();
    });
    
    // 메시지 핸들러 중복 실행 방지
    console.log('메시지 핸들러 설정');
    chatService.setOnMessage(message => {
      console.log('소켓으로부터 메시지 수신:', message);
      handleMessage(message);
    });

    // 채팅방 구독
    if (chatService.isConnected()) {
      console.log('이미 연결됨, 채팅방 구독:', roomId);
      chatService.subscribeToRoom(roomId);
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('컴포넌트 언마운트, 구독 해제:', roomId);
      chatService.unsubscribeFromRoom(roomId);
    };
  }, [roomId, userId, recipientName, chatService]); // receivedMessages 의존성 제거

  // 메시지 전송 함수
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !isConnected) return;
    
    console.log('메시지 전송 시작:', newMessage);
    
    // 사용자가 입력한 메시지를 먼저 UI에 추가 (로컬 메시지)
    const localMsg: Message = {
      id: Date.now(),
      text: newMessage.trim(),
      isMe: true,
      userName: '나',
      timestamp: getCurrentTime(),
    };
    
    console.log('로컬 UI에 메시지 추가:', localMsg);
    
    // 로컬 UI에 메시지 추가
    setMessages(prevMessages => [...prevMessages, localMsg]);
    
    // 웹소켓으로 메시지 전송
    const messageToSend: WebSocketMessage = {
      roomId,
      sender: userId,
      message: newMessage.trim()
    };
    
    console.log('웹소켓으로 전송:', messageToSend);
    chatService.sendMessage(messageToSend);
    
    // 입력창 비우기
    setNewMessage('');
  }, [newMessage, roomId, userId, isConnected, chatService]);

  // 입력 업데이트 핸들러
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  }, []);

  // 키 이벤트 핸들러 (엔터 키로 메시지 전송)
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // 초기 메시지 설정 (이전 대화 기록 등)
  const setInitialMessages = useCallback((initialMessages: Message[]) => {
    console.log('초기 메시지 설정:', initialMessages);
    setMessages(initialMessages);
  }, []);

  return {
    messages,
    receivedMessages,
    newMessage,
    isConnected,
    sendMessage,
    handleInputChange,
    handleKeyPress,
    setInitialMessages,
  };
};

export default useChat;