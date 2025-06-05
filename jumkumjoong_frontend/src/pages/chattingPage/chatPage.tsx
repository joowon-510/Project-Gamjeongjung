// src/pages/chattingPage/chatPage.tsx - 디버깅 코드 추가된 버전
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import nologo from "../../assets/icons/nologo.svg";
import thumbnail from "../../assets/icons/nologo.svg";
import useChat from "../../hooks/useChat";
import {
  ChatUser,
  Message,
  ChatMessageParams,
  ChatMessageDTO,
  WebSocketMessage,
  MessageType,
  SendWebSocketMessage,
  ReceiveWebSocketMessage,
} from "../../types/chat";
import { getChatMessages, getUserChatInfo, readChatRoom } from "../../api/chat";
import { useChatContext } from "../../contexts/ChatContext";
import { format, isToday, isYesterday } from "date-fns";
import { useChatService } from "../../poviders/ChatServiceProvider";
import { getGoodsDetail, postGoodsChangeStatus } from "../../api/goods";
import { useAuthStore } from "../../stores/useUserStore";
import { ko } from "date-fns/locale"; // 한국어 locale 추가

const ChatPage: React.FC = () => {
  const { chatid } = useParams<{ chatid: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<ChatUser | null>(() => {
    // 1. location.state에서 chattingUserNickname 확인 (최우선)
    const stateNickname = location.state?.chattingUserNickname;

    // 2. localStorage에서 nickname 확인 (두번째 우선순위)
    const storedNickname = localStorage.getItem("currentChatUserNickname");

    // 닉네임 결정 (우선순위: state > localStorage > 기본값)
    const finalNickname = stateNickname || storedNickname || "채팅 상대";

    return {
      id: 0, // ID는 API 응답에서 업데이트 예정
      name: finalNickname,
    };
  });
  const [goodsId, setGoodsId] = useState<number | null>(() => {
    const postIdFromState = location.state?.postId;
    if (postIdFromState) return Number(postIdFromState);

    const chatItemMapString = localStorage.getItem("currentPostId");
    if (chatItemMapString && chatid) {
      const chatItemMap = JSON.parse(chatItemMapString);
      return chatItemMap || null;
    }
    return null;
  });

  const processedRoomIds = useRef(new Set<string>());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const readStatusCache: { [key: string]: boolean } = {};
  // 페이지네이션 관련 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [oldScrollHeight, setOldScrollHeight] = useState<number>(0);

  // 사용자 ID 상태 추가
  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    // 로컬 스토리지에서 userId 초기값 설정
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  // ChatContext 사용 (읽음 표시를 위해)
  const { markRoomAsRead } = useChatContext();
  const chatService = useChatService(); // chatService 추가
  const getReadStatusKey = (roomId: string) =>
    `persistent_read_status_${roomId}`;

  const [roomId, setRoomId] = useState<string>(() => {
    // 1. URL 파라미터에서 roomId 확인 (최우선) - chatid는 항상 있어야 함
    const urlRoomId = chatid;

    // 2. location state에서 roomId 확인
    const stateRoomId = location.state?.roomId;

    // 3. localStorage에서 roomId 확인
    const storedRoomId = localStorage.getItem("currentRoomId");

    // 우선순위 순서: URL > state > localStorage
    let finalRoomId = "";

    if (urlRoomId) {
      finalRoomId = urlRoomId;
    } else if (stateRoomId) {
      finalRoomId = stateRoomId;
    } else if (storedRoomId) {
      finalRoomId = storedRoomId;
    } else {
      // 비동기로 리다이렉트 처리
      setTimeout(() => {
        navigate("/chatting");
      }, 100);
    }

    // 최종 선택된 roomId를 localStorage에 저장
    if (finalRoomId) {
      localStorage.setItem("currentRoomId", finalRoomId);
    }

    return finalRoomId;
  });

  // 사용자 ID 가져오기 - 향상된 디버깅
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await getUserChatInfo();
        // 성공 시 로컬 스토리지에 저장 (아래 2번 참조)
      } catch (error) {}
    };
    fetchUserId(); // 조건문 제거 → 무조건 실행
  }, []);

  const [goods, setGoods] = useState<{
    title: string;
    goodsId: number;
    goodsStatus: boolean;
    userName: string;
    img: string;
  }>({
    title: "",
    goodsId: (() => {
      const stateItemId = location.state?.itemId;
      if (stateItemId) return stateItemId;

      const chatItemMapString = localStorage.getItem("currentPostId");
      if (chatItemMapString && chatid) {
        const chatItemMap = JSON.parse(chatItemMapString);
        return chatItemMap || 0; // fallback
      }
      return 0;
    })(),
    goodsStatus: true,
    userName: "",
    img: "",
  });
  // 상품 정보 불러오기
  useEffect(() => {
    const fetchGoods = async () => {
      // if (goodsId) {
      try {
        const response = await getGoodsDetail(goods.goodsId);
        setStatus(response.body.item.status);
        const updated = {
          title: response.body.item.title,
          goodsId: response.body.item.itemId,
          goodsStatus: response.body.item.status,
          userName: response.body.userName,
          img:
            response.body.item.deviceImageList.length > 0
              ? response.body.item.deviceImageList[0]
              : thumbnail,
        };
        setGoods(updated);
      } catch (error) {}
    };
    fetchGoods();
  }, []);

  // 날짜 포맷팅 함수
  const formatMessageTime = (timestamp: string) => {
    // UTC 변환 없이 바로 사용
    const date = new Date(timestamp);

    if (isToday(date)) {
      return format(date, "a h:mm", { locale: ko });
    } else if (isYesterday(date)) {
      return `어제 ${format(date, "a h:mm", { locale: ko })}`;
    } else {
      return format(date, "MM월 dd일 a h:mm", { locale: ko });
    }
  };

  // 웹소켓 메시지 처리 함수 - currentUserId와 비교하여 내 메시지인지 판단
  const processWebSocketMessage = (
    message: WebSocketMessage
  ): Message | null => {
    if (message.type === MessageType.MESSAGE) {
      const messageData = message as SendWebSocketMessage;

      const isMyMessage = messageData.sender === currentUserId;

      // user?.name을 우선적으로 사용하고, 없거나 '상대방'인 경우 location.state에서 가져옴
      const recipientName =
        user?.name && user.name !== "상대방" && user.name !== "채팅 상대"
          ? user.name
          : location.state?.chattingUserNickname ||
            localStorage.getItem("currentChatUserNickname") ||
            "채팅 상대";

      return {
        id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        text: messageData.message,
        timestamp: messageData.createdAt,
        isMe: isMyMessage,
        userName: isMyMessage ? "나" : recipientName,
        read: isMyMessage,
        receivedAt: messageData.createdAt,
      };
    }

    return null;
  };

  // useChat 훅 사용 - currentUserId가 변경될 때 다시 초기화하고 processWebSocketMessage 함수 전달
  const {
    messages,
    newMessage,
    isConnected,
    sendMessage,
    handleInputChange,
    handleKeyPress,
    setInitialMessages,
    addOlderMessages,
  } = useChat({
    roomId: roomId || "", // null인 경우 빈 문자열 전달
    userId: currentUserId ?? 0, // null일 경우 0 사용
    recipientName: user?.name || "",
    processMessage: processWebSocketMessage,
  });

  useEffect(() => {
    // 채팅방 초기화 시 로컬 스토리지 상태 검증
    const validateLocalStorage = () => {
      if (!roomId) return;

      const roomKey = getReadStatusKey(roomId);
      const savedStatuses = localStorage.getItem(roomKey);

      if (savedStatuses) {
        try {
          const readStatuses = JSON.parse(savedStatuses);
          const statusCount = Object.keys(readStatuses).length;
        } catch (e) {
          localStorage.setItem(roomKey, JSON.stringify({}));
        }
      } else {
        localStorage.setItem(roomKey, JSON.stringify({}));
      }
    };

    validateLocalStorage();
  }, [roomId]);

  // 메시지 ID 생성 함수 - ChatPage.tsx에 추가
  const generateMessageId = (dto: ChatMessageDTO): string => {
    // 타임스탬프 추출
    const timestamp = new Date(dto.createdAt).getTime();

    // 메시지 내용 기반 간단한 해시 생성
    const text = dto.message || "";

    // 모든 메시지가 동일한 규칙으로 ID 가짐
    return `msg_${timestamp}_${text.substring(0, Math.min(10, text.length))}_${
      dto.senderId || "unknown"
    }`;
  };

  // DTO를 클라이언트 메시지 형식으로 변환하는 함수
  const convertToClientMessage = (dto: ChatMessageDTO): Message => {
    // 메시지 발신자가 현재 사용자인지 확인
    const isMe =
      dto.senderId !== undefined
        ? dto.senderId === currentUserId
        : dto.toSend === true;

    // 상대방 닉네임 설정
    const recipientName =
      user?.name && user.name !== "상대방" && user.name !== "채팅 상대"
        ? user.name
        : location.state?.chattingUserNickname ||
          localStorage.getItem("currentChatUserNickname") ||
          "채팅 상대";

    // 일관된 메시지 ID 생성
    const messageId = generateMessageId(dto);

    // 읽음 상태 처리 수정
    let isRead = !isMe; // 상대방 메시지는 항상 true (내가 보고 있으므로)

    // 내가 보낸 메시지인 경우만 읽음 상태 확인
    if (isMe) {
      // 1. 메모리 캐시 확인 (가장 빠른 접근)
      if (messageId in readStatusCache) {
        isRead = readStatusCache[messageId];
      } else {
        // 2. 로컬 스토리지 확인
        const roomKey = `chat_read_status_${roomId}`;
        const savedStatuses = localStorage.getItem(roomKey);

        if (savedStatuses) {
          try {
            const readStatuses = JSON.parse(savedStatuses);
            if (messageId in readStatuses) {
              isRead = readStatuses[messageId];
              // 메모리 캐시에 저장
              readStatusCache[messageId] = isRead;
            } else {
              // 서버 데이터 확인
              if ("readAt" in dto && dto.readAt) {
                isRead = true;
              } else if ("isRead" in dto && dto.isRead === true) {
                isRead = true;
              } else if ("read" in dto && (dto as any).read === true) {
                isRead = true;
              }

              // 결정된 상태를 로컬 스토리지와 메모리 캐시에 저장
              readStatuses[messageId] = isRead;
              localStorage.setItem(roomKey, JSON.stringify(readStatuses));
              readStatusCache[messageId] = isRead;
            }
          } catch (e) {
            // 오류 발생 시 새 객체 생성하여 현재 상태 저장
            const newReadStatuses: { [key: string]: boolean } = {};
            newReadStatuses[messageId] = isRead;
            localStorage.setItem(roomKey, JSON.stringify(newReadStatuses));
            readStatusCache[messageId] = isRead;
          }
        } else {
          // 로컬 스토리지에 저장된 상태가 없으면 새로 생성
          const newReadStatuses: { [key: string]: boolean } = {};
          newReadStatuses[messageId] = isRead;
          localStorage.setItem(roomKey, JSON.stringify(newReadStatuses));
          readStatusCache[messageId] = isRead;
        }
      }
    }

    return {
      id: messageId,
      text: dto.message || "",
      timestamp: dto.createdAt,
      isMe: isMe,
      userName: isMe ? "나" : recipientName,
      read: isRead,
      receivedAt: dto.createdAt,
    };
  };

  // 이전 메시지 불러오기 함수
  const loadMessages = async (isInitialLoad = false) => {
    if (isLoading || (!hasMore && !isInitialLoad)) return;

    setIsLoading(true);

    try {
      // 페이지네이션 파라미터 설정
      const params: ChatMessageParams = {
        page: isInitialLoad ? 0 : currentPage + 1, // 초기 로드는 0페이지, 이후는 다음 페이지
        size: 20, // 한 번에 가져올 메시지 수
        sort: "createdAt,desc", // 최신 메시지부터 정렬
      };

      // API 호출
      const response = await getChatMessages(roomId, params);

      // API 응답 확인 및 안전한 접근
      if (
        response &&
        response.status_code === 200 &&
        response.body &&
        response.body.content &&
        Array.isArray(response.body.content)
      ) {
        // 닉네임 추출 - location.state에서 chattingUserNickname을 우선적으로 사용
        const chattingUserNickname =
          location.state?.chattingUserNickname ||
          (chatid === "1"
            ? "AI의 신예훈"
            : chatid === "2"
            ? "재드래곤"
            : "맥북헤이터");

        // 채팅 상대방 정보 설정
        if (isInitialLoad && response.body.otherParticipant) {
          // API 응답에서 받은 상대방 정보로 user 업데이트
          const apiNickname = response.body.otherParticipant.nickname;

          // API 응답의 닉네임을 우선 사용하고, localStorage 값을 다시 업데이트
          setUser({
            id: response.body.otherParticipant.userId,
            name:
              apiNickname || location.state?.chattingUserNickname || "상대방",
          });

          // API에서 받은 닉네임으로 localStorage 업데이트
          if (apiNickname) {
            localStorage.setItem("currentChatUserNickname", apiNickname);
          }
        }

        // DTO를 클라이언트 메시지 형식으로 변환
        const formattedMessages: Message[] = response.body.content.map(
          (dto: ChatMessageDTO) => convertToClientMessage(dto)
        );

        // 더 불러올 메시지가 있는지 확인 (last 필드로 판단)
        setHasMore(!response.body.last && formattedMessages.length > 0);

        // 다음 페이지 번호 업데이트
        if (!isInitialLoad) {
          setCurrentPage(response.body.number);
        }

        // 메시지가 있는 경우만 처리
        if (formattedMessages.length > 0) {
          // 시간 역순으로 정렬된 메시지를 시간순으로 재정렬 (필요한 경우)
          const timeOrderedMessages = [...formattedMessages].reverse();

          if (isInitialLoad) {
            // 초기 로드인 경우 메시지 설정
            setInitialMessages(timeOrderedMessages);
          } else {
            // 이전 메시지 로드인 경우 스크롤 위치 저장
            if (messagesContainerRef.current) {
              setOldScrollHeight(messagesContainerRef.current.scrollHeight);
            }

            // 이전 메시지 추가
            addOlderMessages(timeOrderedMessages);
          }
        } else {
          // 메시지가 없으면 더 불러올 메시지가 없음
          setHasMore(false);
        }

        // 초기 로드인 경우 사용자 정보 설정
        if (isInitialLoad && user === null && !response.body.otherParticipant) {
          setUser({
            id: 0,
            name: chattingUserNickname,
          });
        }
      } else {
        // API 응답이 정상이 아닌 경우
        setHasMore(false);

        if (isInitialLoad) {
          // 빈 메시지 배열 설정
          setInitialMessages([]);

          // 닉네임 설정
          const chattingUserNickname =
            location.state?.chattingUserNickname ||
            (chatid === "1"
              ? "AI의 신예훈"
              : chatid === "2"
              ? "재드래곤"
              : "맥북헤이터");

          // 기본 사용자 정보 설정
          setUser({
            id: 0,
            name: chattingUserNickname,
          });
        }
      }
    } catch (error) {
      setHasMore(false);

      if (isInitialLoad) {
        // 빈 메시지 배열 설정
        setInitialMessages([]);

        // 닉네임 설정
        const chattingUserNickname =
          location.state?.chattingUserNickname ||
          (chatid === "1"
            ? "AI의 신예훈"
            : chatid === "2"
            ? "재드래곤"
            : "맥북헤이터");

        // 오류 발생 시 기본 사용자 정보 설정
        setUser({
          id: 0,
          name: chattingUserNickname,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 채팅방 초기 데이터 로드 - userId가 로드된 후에 실행
  useEffect(() => {
    if (currentUserId) {
      loadMessages(true);
    }
  }, [chatid, location.state, currentUserId]); // currentUserId 의존성 추가

  // 스크롤 위치 관련 처리 (이전 메시지 로드 후)
  useEffect(() => {
    if (oldScrollHeight > 0 && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - oldScrollHeight;
      messagesContainerRef.current.scrollTop = scrollDiff;

      // 스크롤 위치 조정 후 상태 초기화
      setOldScrollHeight(0);
    }
  }, [messages, oldScrollHeight]);

  useEffect(() => {
    if (isConnected && roomId && currentUserId) {
      // 토큰 확인
      const token = localStorage.getItem("accessToken");

      if (!token) {
        return;
      }

      // 채팅방에 접속했음을 알리는 RECEIVE 메시지 전송
      // 이것은 상대방에게 "나는 상대방이 보낸 메시지를 읽었다"는 신호임
      const timer = setTimeout(() => {
        const currentTime = new Date().toISOString();
        const receiveMessage: ReceiveWebSocketMessage = {
          type: MessageType.RECEIVE,
          roomId: roomId,
          receiver: currentUserId,
          receiveAt: currentTime,
          createdAt: currentTime,
        };

        chatService.sendMessage(receiveMessage);

        // 채팅방 읽음 상태 업데이트 (UI에서 읽지 않은 메시지 카운트 등을 위함)
        markRoomAsRead(roomId);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, roomId, currentUserId, chatService, markRoomAsRead]);

  useEffect(() => {
    const markChatAsRead = async () => {
      if (!roomId) {
        return;
      }

      try {
        const response = await readChatRoom(roomId);

        // 응답이 성공이면 채팅방 컨텍스트에도 읽음 상태 업데이트
        if (response.status_code === 200) {
          markRoomAsRead(roomId);
        }
      } catch (error) {}
    };

    // 컴포넌트 마운트 시 API 호출
    markChatAsRead();

    // roomId가 변경될 때마다 API 호출
  }, [roomId, markRoomAsRead]);

  // 메시지 목록이 업데이트될 때 스크롤을 맨 아래로 이동 (초기 로드 또는 새 메시지 수신 시)
  useEffect(() => {
    // 이전 메시지 로드 중이 아닐 때만 스크롤 아래로 이동
    if (!oldScrollHeight) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (!chatid || !goodsId) return;

    // 1. 기존 chatItemMap 불러오기
    const chatItemMapString = localStorage.getItem("chatItemMap");
    const chatItemMap = chatItemMapString ? JSON.parse(chatItemMapString) : {};

    // 2. 현재 roomId에 해당하는 itemId가 없으면 저장
    if (!chatItemMap[chatid]) {
      chatItemMap[chatid] = goodsId;
      localStorage.setItem("chatItemMap", JSON.stringify(chatItemMap));
    }
  }, [chatid, goodsId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 뒤로가기 처리
  const handleGoBack = () => {
    window.history.back();
  };

  // 메시지 전송 버튼 핸들러
  const handleSendButtonClick = () => {
    if (newMessage.trim() === "" || !isConnected) return;

    sendMessage();

    // 메시지 전송 후 읽음 상태 메시지 전송 (상대방이 보낸 메시지를 읽었다는 신호)
    if (roomId && currentUserId) {
      setTimeout(() => {
        const currentTime = new Date().toISOString();
        const receiveMessage: ReceiveWebSocketMessage = {
          type: MessageType.RECEIVE,
          roomId: roomId,
          receiver: currentUserId,
          receiveAt: currentTime,
          createdAt: currentTime,
        };

        chatService.sendMessage(receiveMessage);
      }, 500);
    }

    // 스크롤을 아래로 내림
    setTimeout(scrollToBottom, 100);
  };

  useEffect(() => {
    const updateMessageReadStatus = async () => {
      // 이미 처리한 roomId인지 확인
      if (!roomId || processedRoomIds.current.has(roomId)) {
        return;
      }

      // 로직 실행 전 현재 roomId를 처리 목록에 추가
      processedRoomIds.current.add(roomId);

      if (!currentUserId) {
        return;
      }

      try {
        const response = await readChatRoom(roomId);

        // API 응답에서 읽음 시간 추출
        const readTime = response.body;

        if (response.status_code === 200 && readTime) {
          // 메시지 로드 확인을 위한 대기
          // 메시지가 로드되지 않았을 수 있으므로 일정 시간 대기
          setTimeout(() => {
            updateMessagesWithReadTime(readTime);
          }, 500);
        }
      } catch (error) {}
    };

    // 메시지 읽음 상태 업데이트 함수 분리
    const updateMessagesWithReadTime = (readTime: string) => {
      // 읽음 시간 이전의 내 메시지는 모두 읽음 상태로 변경
      const readTimeStamp = new Date(readTime).getTime();

      // 현재 메시지 가져오기 (이 시점에서는 메시지가 로드되어 있어야 함)
      const currentMessages = messages;
      if (currentMessages.length === 0) {
        return;
      }

      // 메시지 배열 업데이트
      const updatedMessages = currentMessages.map((msg) => {
        // 내가 보낸 메시지이고, 생성 시간이 읽음 시간보다 이전인 경우에만 읽음 처리
        if (msg.isMe && new Date(msg.timestamp).getTime() <= readTimeStamp) {
          return { ...msg, read: true };
        }
        return msg;
      });

      // 업데이트된 메시지로 상태 변경
      setInitialMessages(updatedMessages);

      // 로컬 스토리지의 읽음 상태도 업데이트
      const roomKey = `chat_read_status_${roomId}`;
      let readStatuses: { [key: string]: boolean } = {};

      // 기존 저장된 상태 확인
      const savedStatuses = localStorage.getItem(roomKey);
      if (savedStatuses) {
        try {
          readStatuses = JSON.parse(savedStatuses);
        } catch (e) {
          readStatuses = {};
        }
      }

      // 메시지 읽음 상태 업데이트
      updatedMessages.forEach((msg) => {
        if (msg.isMe && msg.read !== undefined) {
          readStatuses[msg.id] = msg.read;
        }
      });

      // 업데이트된 읽음 상태 저장
      localStorage.setItem(roomKey, JSON.stringify(readStatuses));

      // 채팅방 컨텍스트 읽음 상태도 업데이트
      markRoomAsRead(roomId);
    };

    // 연결되어 있을 때만 실행
    if (isConnected) {
      updateMessageReadStatus();
    }

    // roomId가 변경될 때만 실행
  }, [roomId, currentUserId, isConnected, markRoomAsRead, setInitialMessages]);

  // 이전 메시지 더 불러오기 버튼 핸들러
  const handleLoadMoreMessages = () => {
    if (!isLoading && hasMore) {
      loadMessages(false);
    }
  };

  // 거래 상태
  const [status, setStatus] = useState<boolean>(goods.goodsStatus);
  const userInfo = useAuthStore();
  const handleTransactionClick = async () => {
    if (userInfo.nickname !== goods.userName) return; // 본인만 변경 가능

    const newStatus = !status; // 즉시 반영
    setStatus(newStatus); // 로컬 상태 업데이트 (UI 즉시 반영)
    try {
      const response = await postGoodsChangeStatus(goods.goodsId, newStatus);
      if (response) {
        // 실제 서버 상태를 다시 가져와서 동기화
        const updated = await getGoodsDetail(goods.goodsId);
        setStatus(updated.body.item.status); // 서버 상태로 덮어쓰기
      } else {
        throw new Error("응답 없음");
      }
    } catch (error) {
      setStatus(!newStatus); // 실패 시 롤백
      alert("거래 상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 작성
  const handleReviewClick = () => {
    if (userInfo.nickname !== goods.userName) {
      // if (!status && userInfo.nickname !== goods.userName) {
      navigate("/reviews/register", {
        state: { itemId: goods.goodsId, userName: goods.userName },
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 배경 이미지 */}
      <img
        src={nologo}
        alt="logo"
        className="fixed w-[216px] h-[216px] top-1/3 left-1/4 opacity-40 pointer-events-none z-0"
      />

      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="border-b flex items-center justify-between pr-4">
          <div className="flex items-center h-16 px-4 ">
            <button onClick={handleGoBack} className="p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="ml-4 text-lg font-semibold">
              {user?.name || "채팅"}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* 거래 상태 버튼 */}
            <button
              className="text-[#ffffff] self-end "
              onClick={handleTransactionClick}
            >
              {status ? (
                userInfo.nickname === goods.userName ? (
                  <div className="rounded-md bg-fifth p-[6px]">
                    <p>거래 중</p>
                  </div>
                ) : (
                  <span></span>
                )
              ) : (
                <div className=" rounded-md bg-second/60 p-[6px]">
                  <p>거래 완료</p>
                </div>
              )}
            </button>
            {/* 리뷰 작성 */}
            {/* 거래 중이면 리뷰 작성 뜨지 않고
                거래 완료 되어야지 리뷰 작성 뜨도록
            */}
            <button
              className="text-[#ffffff] self-end "
              onClick={handleReviewClick}
            >
              {!status && userInfo.nickname !== goods.userName ? (
                <div className="rounded-md bg-third text-white p-[6px]">
                  <p>리뷰 작성</p>
                </div>
              ) : (
                <span></span>
              )}
            </button>
          </div>
        </div>

        <div
          className="flex p-2 justify-between items-center"
          onClick={() => {
            navigate(`/goods/detail/${goods.goodsId}`);
          }}
        >
          <div className="flex gap-2 items-center ml-1">
            <img
              src={goods.img}
              alt="thumbnail"
              className={`w-[90px] h-[90px] rounded-md ${
                goods.img === thumbnail ? "opacity-50 bg-first/20" : ""
              } `}
            />
            {goods.title.length > 15 ? (
              <p>{goods.title.slice(0, 15)} ...</p>
            ) : (
              goods.title
            )}
          </div>
          <div className="text-first/60 underline">바로가기</div>
        </div>
      </header>

      {/* 메시지 목록 */}
      <div
        className="flex-1 overflow-y-auto p-4 z-10 mb-10"
        ref={messagesContainerRef}
        onScroll={(e) => {
          const { scrollTop } = e.currentTarget;
          if (scrollTop < 50 && hasMore && !isLoading) {
            handleLoadMoreMessages();
          }
        }}
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.id}-${index}`}
              className={`flex ${
                message.isMe ? "justify-end" : "justify-start"
              }`}
              // className={`flex flex-col ${
              //   message.isMe ? "items-end" : "items-start"
              // }`}
            >
              {/* <div
                className={`max-w-[70%] ${
                  message.isMe ? "order-1" : "order-2"
                }`}
              > */}
              <div className="flex flex-col max-w-[70%]">
                {/* 상대방 메시지인 경우 닉네임 표시 */}
                {!message.isMe && (
                  <div className="ml-1 text-xs text-gray-600 mb-1">
                    {user?.name || message.userName}
                  </div>
                )}

                {/* 메시지 말풍선 */}
                {/* <div className="flex"> */}
                <div className="flex items-end gap-1">
                  {/* 내가 보낸 메시지이고 읽지 않은 경우만 1 표시 - 읽음 상태 디버깅용 data-read 속성 추가 */}
                  {message.isMe && !message.read && (
                    <span
                      // className="mr-1 text-l mt-2 text-black font-bold"
                      className="text-l text-black font-bold"
                      data-testid={`unread-marker-${message.id}`}
                      data-read={message.read ? "false" : "true"}
                    >
                      1
                    </span>
                  )}
                  <div
                    // className={`rounded-xl px-4 py-2 max-w-[100%] break-words whitespace-pre-wrap ${
                    //   // className={`rounded-xl px-4 py-2 max-w-[100%] mr-auto break-words whitespace-pre-wrap ${
                    //   message.isMe
                    //     ? "bg-blue-500 text-white rounded-tr-none self-end"
                    //     : "bg-gray-200 text-gray-800 rounded-tl-none self-start"
                    // }`}
                    className={`rounded-xl px-4 py-2 break-words break-all overflow-wrap whitespace-pre-wrap ${
                      message.isMe
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
                {/* 메시지 시간 표시 */}
                <div
                  // className={`flex items-center mt-1 ${
                  //   message.isMe ? "justify-end" : "justify-start"
                  // }`}
                  className={`text-xs text-gray-500 mt-1 ${
                    message.isMe ? "text-right" : "text-left"
                  }`}
                >
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="fixed bottom-0 w-full bg-white border-t p-2 z-10">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent outline-none"
            />
          </div>
          <button
            onClick={handleSendButtonClick}
            disabled={newMessage.trim() === "" || !isConnected}
            className="ml-2 p-2 text-gray-500 disabled:text-gray-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
