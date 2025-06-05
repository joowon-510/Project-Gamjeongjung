import axios from "axios";
import { useAuthStore } from "../stores/useUserStore";

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  // baseURL: "http://localhost:8080/api/",
  timeout: 5000,
  headers: {
    // "Content-Type": "application/json",
  },
});

// 요청 시마다 상태에서 accessToken을 가져와서 헤더에 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // 먼저 스토어에서 토큰 확인
    const storeToken = useAuthStore.getState().accessToken;
    // 스토어에 없으면 로컬 스토리지에서 확인
    const localToken = localStorage.getItem("accessToken");

    // 사용할 토큰 결정 (스토어 우선)
    const tokenToUse = storeToken || localToken;

    if (tokenToUse) {
      config.headers["Authorization"] = `Bearer ${tokenToUse}`;

      // 스토어에 토큰이 없지만 로컬 스토리지에는 있는 경우, 스토어 업데이트
      if (!storeToken && localToken) {
        useAuthStore.getState().setAccessToken(localToken);
      }
    } else {
      // 개발 환경에서 테스트용 토큰 사용 (선택사항
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 (선택사항)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
