// src/api/axiosFastAPI.ts
import axios from "axios";
import { useAuthStore } from "../stores/useUserStore";

const fastapiInstance = axios.create({
  baseURL: " https://3.39.9.184:8443",
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

    console.log("🔑 토큰 확인:", {
      스토어: storeToken ? "있음" : "없음",
      로컬스토리지: localToken ? "있음" : "없음",
    });

    if (tokenToUse) {
      config.headers["Authorization"] = `Bearer ${tokenToUse}`;
      if (!storeToken && localToken) {
        useAuthStore.getState().setAccessToken(localToken);
      }
    } else {
      console.warn("⚠️ FastAPI: 액세스 토큰이 없습니다.");
    }

    return config;
  },
  (error) => {
    console.error("❌ FastAPI 요청 인터셉터 오류:", error);
    return Promise.reject(error);
  }
);

fastapiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("📡 FastAPI 응답 오류:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    return Promise.reject(error);
  }
);

export default fastapiInstance;
