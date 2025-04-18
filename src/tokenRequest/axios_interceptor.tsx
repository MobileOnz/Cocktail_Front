import { API_BASE_URL } from "@env";
import { getToken, isTokenExpired, tokenRefresh } from "./Token";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
});

instance.interceptors.request.use(
  async (config) => {
    const accessToken = await getToken();

    if (!accessToken) {
      throw new Error("⛔️ 토큰 없음: 로그인 필요");
    }

    // FormData가 아닐 때만 application/json 설정
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    config.headers["Authorization"] = `${accessToken}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // access token 만료로 401이 발생한 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지

      try {
        const tokenExpired = await isTokenExpired();

        if (tokenExpired) {
          const refreshExpired = await tokenRefresh(); // true면 만료됨

          if (refreshExpired) {
            await AsyncStorage.clear(); // 로그아웃 처리
            return Promise.reject(new Error("⛔️ 리프레시 토큰 만료: 재로그인 필요"));
          }

          // 새 access token을 다시 설정 후 재요청
          const newToken = await getToken();
          originalRequest.headers["Content-Type"] = "application/json";
          originalRequest.headers["Authorization"] = `${newToken}`;

          return axios(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(
          refreshError instanceof Error
            ? refreshError
            : new Error("리프레시 실패: " + JSON.stringify(refreshError))
        );
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
