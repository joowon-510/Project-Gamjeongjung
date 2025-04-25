// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  Message, 
  WebSocketMessage, 
  SendWebSocketMessage,
  ReceiveWebSocketMessage,
  MessageType 
} from '../types/chat';
import { useChatService } from '../poviders/ChatServiceProvider';
import { getCurrentTime } from '../utils/chatUtils';
import { useChatContext } from '../contexts/ChatContext';

interface UseChatOptions {
  roomId: number;
  userId: number;
  recipientName: string;
}

export const useChat = ({ roomId, userId, recipientName }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastProcessedMessage, setLastProcessedMessage] = useState<{sender: number, message: string} | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  const chatService = useChatService();
  const { updateLastReceivedMessage } = useChatContext();

  useEffect(() => {
    console.log('useEffect: 웹소켓 설정 시작', roomId, userId);
    
    const handleConnectionChange = () => {
      setIsConnected(chatService.isConnected());
      console.log('연결 상태 변경:', chatService.isConnected());
    };

    const handleMessage = (message: WebSocketMessage) => {
      console.log('메시지 수신 핸들러 실행:', message);
      
      // 메시지 타입에 따라 처리 방식 분기
      if (message.type === MessageType.MESSAGE) {
        // 자신이 보낸 메시지면 무시
        if (message.sender === userId) {
          console.log('자신이 보낸 메시지 무시');
          return;
        }
        
        // 동일한 메시지 중복 처리 방지
        const isDuplicate = 
          lastProcessedMessage?.sender === message.sender && 
          lastProcessedMessage?.message === message.message;
        
        if (isDuplicate) {
          console.log('중복 메시지 무시:', message);
          return;
        }
        
        // 마지막으로 처리된 메시지 업데이트
        setLastProcessedMessage({
          sender: message.sender,
          message: message.message
        });
        
        // 상대방 메시지만 UI에 추가
        const newMsg: Message = {
          id: Date.now(),
          text: message.message,
          isMe: false,
          userName: recipientName,
          timestamp: getCurrentTime(),
          read: false
        };
        
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
        updateLastReceivedMessage(roomId, message);
      } else if (message.type === MessageType.RECEIVE) {
        // 메시지 읽음 처리 로직 (필요한 경우 추가)
        console.log('메시지 수신 확인:', message);
        
        // 읽음 상태 업데이트 로직 추가 가능
        // 예: 해당 메시지의 read 상태 변경 등
        setMessages(prevMessages => 
          prevMessages.map(msg => ({
            ...msg,
            read: msg.isMe ? true : msg.read
          }))
        );
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
  }, [roomId, userId, recipientName, chatService]);

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
      read: false
    };
    
    console.log('로컬 UI에 메시지 추가:', localMsg);
    
    setMessages(prevMessages => [...prevMessages, localMsg]);
    
    // 웹소켓으로 메시지 전송
    const messageToSend: SendWebSocketMessage = {
      type: MessageType.MESSAGE,
      roomId,
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

  return {
    messages,
    newMessage,
    isConnected,
    sendMessage,
    handleInputChange,
    handleKeyPress,
    setInitialMessages,
  };
};

export default useChat;