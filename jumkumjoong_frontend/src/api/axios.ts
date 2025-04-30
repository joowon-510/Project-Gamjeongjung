import axios from "axios";
import { useAuthStore } from "../stores/useUserStore";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 시마다 상태에서 accessToken을 가져와서 헤더에 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    
    console.log('🔑 현재 Access Token:', accessToken);
    
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      console.log('✅ 토큰이 요청 헤더에 추가되었습니다.');
    } else {
      console.warn('⚠️ 액세스 토큰이 없습니다.');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 (선택사항)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('📡 API 응답 오류:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;