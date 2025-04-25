import axios from "axios";
import { useAuthStore } from "../stores/useUserStore";
import { access } from "fs";
const accessToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdXlvbjA0MjJAZ21haWwuY29tIiwibmFtZSI6IuuwleyImOyXsC4iLCJpYXQiOjE3NDU1NTM1MjMsImV4cCI6MTg0NTU1MzUyM30.Uswg6G1-kecOddIvBovuRyFOqIEwc3MLFz0YQdKBHD259qn9BQ4xwqJNEMHeDfMJ8L0K2NwY86mOkpRC3NuvKw"
export const axiosInstance = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: "http://localhost:8080/api",
  // baseURL: process.env.REACT_APP_API_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "Authorization" : "Bearer " + accessToken,
  },
});

// 요청 시마다 상태에서 accessToken을 가져와서 헤더에 추가
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const { accessToken } = useAuthStore.getState();
//     if (accessToken) {
//       config.headers["Authorization"] = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
