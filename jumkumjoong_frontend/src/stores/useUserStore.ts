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
