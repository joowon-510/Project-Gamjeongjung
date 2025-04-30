// src/hooks/useChat.ts - 오류 수정한 버전
import { useState, useEffect, useCallback } from 'react';
import { 
  Message, 
  WebSocketMessage, 
  SendWebSocketMessage,
  ReceiveWebSocketMessage,
  MessageType,
  ChatHookParams
} from '../types/chat';
import { useChatService } from '../poviders/ChatServiceProvider';
import { getCurrentTime } from '../utils/chatUtils';
import { useChatContext } from '../contexts/ChatContext';

export const useChat = ({ 
  roomId, 
  userId, 
  recipientName,
  processMessage // 이제 ChatHookParams에 정의됨
}: ChatHookParams) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastProcessedMessage, setLastProcessedMessage] = useState<{sender: number, message: string} | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  const chatService = useChatService();
  const { 
    updateLastReceivedMessage, 
    processIncomingMessage: contextProcessMessage,
    updateLastAccessTime
  } = useChatContext();

  // 컴포넌트 마운트 시 마지막 접속 시간 업데이트
  useEffect(() => {
    updateLastAccessTime();
  }, [updateLastAccessTime]);

  useEffect(() => {
    console.log('useEffect: 웹소켓 설정 시작', roomId, userId, 'roomId type:', typeof roomId);
    
    const handleConnectionChange = () => {
      setIsConnected(chatService.isConnected());
      console.log('연결 상태 변경:', chatService.isConnected());
    };

    const handleMessage = (message: WebSocketMessage) => {
      console.log('메시지 수신 핸들러 실행:', message);
      
      // 메시지 타입에 따라 처리 방식 분기
      if (message.type === MessageType.MESSAGE) {
        // 자신이 보낸 메시지면 무시
        if ((message as SendWebSocketMessage).sender === userId) {
          console.log('자신이 보낸 메시지 무시');
          return;
        }
        
        // 동일한 메시지 중복 처리 방지
        const isDuplicate = 
          lastProcessedMessage?.sender === (message as SendWebSocketMessage).sender && 
          lastProcessedMessage?.message === (message as SendWebSocketMessage).message;
        
        if (isDuplicate) {
          console.log('중복 메시지 무시:', message);
          return;
        }
        
        // 마지막으로 처리된 메시지 업데이트
        setLastProcessedMessage({
          sender: (message as SendWebSocketMessage).sender,
          message: (message as SendWebSocketMessage).message
        });
        
        // 커스텀 메시지 처리 함수가 있으면 사용, 없으면 기존 함수 사용
        let newMsg: Message;
        
        if (processMessage) {
          const processedMsg = processMessage(message);
          if (processedMsg) {
            newMsg = processedMsg;
          } else {
            // processMessage가 null을 반환한 경우 기존 함수 사용
            newMsg = contextProcessMessage(message as SendWebSocketMessage);
            newMsg.userName = recipientName;
          }
        } else {
          // 기존 처리 방식
          newMsg = contextProcessMessage(message as SendWebSocketMessage);
          newMsg.userName = recipientName;
        }
        
        console.log('UI에 메시지 추가:', newMsg);
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, newMsg];
          console.log('업데이트된 메시지 배열:', updatedMessages);
          return updatedMessages;
        });

        // 메시지 수신 확인 메시지 전송
        const receiveConfirmation: ReceiveWebSocketMessage = {
          type: MessageType.RECEIVE,
          roomId: message.roomId,
          receiver: userId,
          createdAt: new Date().toISOString(),
          receiveAt: new Date().toISOString()
        };

        console.log('메시지 수신 확인 전송:', receiveConfirmation);
        chatService.sendMessage(receiveConfirmation);

        // 마지막 메시지 컨텍스트에 업데이트
        updateLastReceivedMessage(message.roomId, message);
      } else if (message.type === MessageType.RECEIVE) {
        // 메시지 읽음 처리 로직 (필요한 경우 추가)
        console.log('메시지 수신 확인:', message);
      }
    };

    if (!chatService.isConnected()) {
      console.log('웹소켓 연결 시작');
      chatService.connect();
    }

    setIsConnected(chatService.isConnected());
    console.log('초기 연결 상태:', chatService.isConnected());

    const onConnectHandler = () => {
      console.log('연결 성공 이벤트');
      handleConnectionChange();
      chatService.subscribeToRoom(roomId);
      console.log('채팅방 구독:', roomId);
    };

    chatService.setOnConnect(onConnectHandler);
    chatService.setOnError(() => {
      console.log('연결 오류 발생');
      handleConnectionChange();
    });
    
    console.log('메시지 핸들러 설정');
    chatService.setOnMessage(message => {
      console.log('소켓으로부터 메시지 수신:', message);
      handleMessage(message);
    });

    if (chatService.isConnected()) {
      console.log('이미 연결됨, 채팅방 구독:', roomId);
      chatService.subscribeToRoom(roomId);
    }
    
    return () => {
      console.log('컴포넌트 언마운트, 구독 해제:', roomId);
      chatService.unsubscribeFromRoom(roomId);
    };
  }, [roomId, userId, recipientName, chatService, contextProcessMessage, updateLastReceivedMessage, processMessage]);

  // 메시지 전송 함수
  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !isConnected) return;
    
    console.log('메시지 전송 시작:', newMessage);
    
    // 사용자가 입력한 메시지를 먼저 UI에 추가 (로컬 메시지)
    const localMsg: Message = {
      id: Date.now().toString(), // number를 string으로 변환
      text: newMessage.trim(),
      isMe: true,
      userName: '나',
      timestamp: new Date().toISOString(),
      read: true,
      receivedAt: new Date().toISOString()
    };
    
    console.log('로컬 UI에 메시지 추가:', localMsg);
    
    setMessages(prevMessages => [...prevMessages, localMsg]);
    
    // 웹소켓으로 메시지 전송
    const messageToSend: SendWebSocketMessage = {
      type: MessageType.MESSAGE,
      roomId: roomId,
      sender: userId,
      message: newMessage.trim(),
      createdAt: new Date().toISOString()
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

  // 초기 메시지 설정
  const setInitialMessages = useCallback((initialMessages: Message[]) => {
    console.log('초기 메시지 설정:', initialMessages);
    setMessages(initialMessages);
  }, []);

  // 이전 메시지 추가 함수
  const addOlderMessages = useCallback((olderMessages: Message[]) => {
    console.log('이전 메시지 추가:', olderMessages);
    setMessages(prevMessages => [...olderMessages, ...prevMessages]);
  }, []);

  return {
    messages,
    newMessage,
    isConnected,
    sendMessage,
    handleInputChange,
    handleKeyPress,
    setInitialMessages,
    addOlderMessages,
  };
};

export default useChat;