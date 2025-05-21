// src/api/axiosFastAPI.ts
import axios from "axios";
import { useAuthStore } from "../stores/useUserStore";

const fastapiInstance = axios.create({
  // baseURL: "http://3.39.9.184:8000",
  baseURL: "https://gamjeongjung.co.kr/ai",
  // baseURL: "https://3.39.9.184:8443",
  // baseURL: process.env.REACT_APP_FASTAPI_URL, // 예: http://localhost:8000/
  timeout: 20000,
  headers: {
    // "Content-Type": "application/json",
  },
});

fastapiInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // ✅ 자동 설정되도록
    }
    const storeToken = useAuthStore.getState().accessToken;
    const localToken = localStorage.getItem("accessToken");
    const tokenToUse = storeToken || localToken;

    if (tokenToUse) {
      config.headers["Authorization"] = `Bearer ${tokenToUse}`;
      if (!storeToken && localToken) {
        useAuthStore.getState().setAccessToken(localToken);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

fastapiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default fastapiInstance;
