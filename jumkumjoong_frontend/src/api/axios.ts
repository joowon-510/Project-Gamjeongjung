import axios from "axios";
import { useAuthStore } from "../stores/useUserStore";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  // baseURL: "http://localhost:8080/api",
  // baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 시마다 상태에서 accessToken을 가져와서 헤더에 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
