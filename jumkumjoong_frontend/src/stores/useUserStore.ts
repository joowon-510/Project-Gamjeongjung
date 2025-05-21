import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  removeAccessToken: () => void;
  removeRefreshToken: () => void;
  removeNickname: () => void;
  removeEmail: () => void;
  removeStatus: () => void;
}

export interface WishItemState {
  createdAt: string;
  itemId: number;
  itemName: string;
  itemPrice: number;
  itemStatus: boolean;
  deviceImageUrl: string;
}

interface WishListState {
  items: WishItemState[];
  setItems: (items: WishItemState[]) => void;
  addItem: (item: WishItemState) => void;
  removeItem: (itemId: number) => void; // 추후 삭제 기능 만들면 주석 해제
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      nickname: null,
      email: null,
      status: null,
      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setNickname: (nickname) => set({ nickname }),
      setEmail: (email) => set({ email }),
      setStatus: (status) => set({ status }),
      removeAccessToken: () => set({ accessToken: null }),
      removeRefreshToken: () => set({ refreshToken: null }),
      removeNickname: () => set({ nickname: null }),
      removeEmail: () => set({ email: null }),
      removeStatus: () => set({ status: null }),
    }),
    {
      name: "user-auth-store", // 🔐 localStorage에 저장될 키 이름
    }
  )
);

export const useWishItemStore = create<WishListState>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.itemId !== itemId),
        })),
    }),
    {
      name: "wish-item-storage", // localStorage key
    }
  )
);
