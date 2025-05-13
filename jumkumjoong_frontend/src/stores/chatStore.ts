// src/stores/chatStore.ts
import { create } from 'zustand';

interface ChatRoomItem {
  roomId: string;
  chattingUserNickname: string;
  nonReadCount: number;
  lastMessage: string;
  postTitle: string;
  createdAt?: string;
  lastUpdatedAt?: string;
}

interface EnhancedChatRoomItem extends ChatRoomItem {
  sellerNameFromContext?: string;
  itemTitleFromContext?: string;
  isSelected?: boolean;
}

interface ChatStore {
  chatRooms: EnhancedChatRoomItem[];
  setChatRooms: (rooms: EnhancedChatRoomItem[] | ((prev: EnhancedChatRoomItem[]) => EnhancedChatRoomItem[])) => void;
  markAsRead: (roomId: string) => void;
  updateChatRoom: (roomId: string, updates: Partial<EnhancedChatRoomItem>) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatRooms: [],
  
  setChatRooms: (rooms) => set((state) => ({
    chatRooms: typeof rooms === 'function' ? rooms(state.chatRooms) : rooms
  })),
  
  markAsRead: (roomId) => set((state) => ({
    chatRooms: state.chatRooms.map(room => 
      room.roomId === roomId ? { ...room, nonReadCount: 0 } : room
    )
  })),
  
  updateChatRoom: (roomId, updates) => set((state) => ({
    chatRooms: state.chatRooms.map(room => 
      room.roomId === roomId ? { ...room, ...updates } : room
    )
  }))
}));