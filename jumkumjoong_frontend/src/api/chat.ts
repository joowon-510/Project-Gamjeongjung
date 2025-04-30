// src/api/chat.ts
import axios from 'axios';
import {
  ChatResponse,
  ChatRoom,
  ChatMessageResponse,
  ChatMessageParams,
  PageResponse,
  ChatMessageDTO
} from '../types/chat';

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// 채팅방 생성 요청 타입
interface CreateChatRoomRequest {
  sellerId: number;
  itemId: number;
}

// 채팅방 생성
export const createChatRoom = async (data: CreateChatRoomRequest) => {
  try {
    const response = await axios.get<ChatResponse<ChatRoom>>(`${BASE_URL}/chatting`, { params: data });
    return response.data;
  } catch (error) {
    console.error('채팅방 생성 오류:', error);
    throw error;
  }
};

// 채팅방 목록 조회
export const getChatRooms = async () => {
  try {
    const response = await axios.get<ChatResponse<ChatRoom[]>>(`${BASE_URL}/chatting`);
    return response.data;
  } catch (error) {
    console.error('채팅방 목록 조회 오류:', error);
    throw error;
  }
};

// 특정 채팅방의 메시지 조회 (페이지네이션 지원)
export const getChatMessages = async (roomId: string, params?: ChatMessageParams) => {
  try {
    // Spring Page 형식에 맞게 파라미터 조정
    const queryParams = {
      page: params?.page || 0,
      size: params?.size || 20,
      sort: params?.sort || 'createdAt,desc' // 최신 메시지부터 정렬
    };

    const response = await axios.get<ChatMessageResponse>(`${BASE_URL}/chatting/${roomId}`, {
      params: queryParams
    });
    
    // 응답 확인 및 안전한 접근을 위한 처리
    if (!response.data || !response.data.body || !response.data.body.content) {
      console.error('API 응답 구조가 예상과 다릅니다:', response);
      // 빈 응답 반환
      return {
        status_code: response.status || 500,
        body: {
          content: [],
          pageable: {
            pageNumber: 0,
            pageSize: 0,
            sort: { empty: true, sorted: false, unsorted: true },
            offset: 0,
            paged: true, 
            unpaged: false
          },
          size: 0,
          number: 0,
          sort: { empty: true, sorted: false, unsorted: true },
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true
        }
      } as ChatMessageResponse;
    }
    
    return response.data;
  } catch (error) {
    console.error('채팅 메시지 조회 오류:', error);
    
    // 에러 발생 시 기본 응답 반환
    return {
      status_code: 500,
      body: {
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: 0,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: 0,
          paged: true, 
          unpaged: false
        },
        size: 0,
        number: 0,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true
      }
    } as ChatMessageResponse;
  }
};

// 채팅방 삭제
export const deleteChatRoom = async (roomId: string) => {
  try {
    const response = await axios.delete<ChatResponse>(`${BASE_URL}/chatting/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('채팅방 삭제 오류:', error);
    throw error;
  }
};