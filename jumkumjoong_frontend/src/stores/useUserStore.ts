import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  nickname: string | null;
  email: string | null;
  status: number | null;
  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setNickname: (nickname: string | null) => void;
  setEmail: (email: string | null) => void;
  setStatus: (status: number | null) => void;
}

export interface WishItemState {
  createdAt: string;
  itemId: number;
  itemName: string;
  itemPrice: number;
  itemStatus: boolean;
}

interface WishListState {
  items: WishItemState[];
  setItems: (items: WishItemState[]) => void;
  addItem: (item: WishItemState) => void;
  removeItem: (itemId: number) => void; // 추후 삭제 기능 만들면 주석 해제
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  nickname: null,
  email: null,
  status: null,
  setAccessToken: (accessToken) => set({ accessToken: accessToken }),
  setRefreshToken: (refreshToken) => set({ refreshToken: refreshToken }),
  setNickname: (nickname) => set({ nickname: nickname }),
  setEmail: (email) => set({ email: email }),
  setStatus: (status) => set({ status: status }),
}));

export const useWishItemStore = create<WishListState>((set) => ({
  items: [],
  setItems: (items) => set({ items: items }),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item], // 기존 items에 새 item 추가
    })),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.itemId !== itemId), // 해당 itemId를 가진 아이템 제거
    })),
}));
