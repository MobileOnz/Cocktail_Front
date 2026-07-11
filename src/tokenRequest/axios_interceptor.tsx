import { API_BASE_URL } from '@env';
import { getToken, tokenRefresh } from './Token';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const BASE_URL = API_BASE_URL || 'http://onz-cocktail.kr/onz';
console.log('[Axios] BASE_URL:', BASE_URL);

// 비로그인은 정상 상태다. 화면을 여는 것만으로 "로그인을 해주세요" 토스트가 뜨면 안 된다.
// 토스트는 사용자가 로그인이 필요한 동작(북마크, 보관함 열기 등)을 명시적으로 눌렀을 때만 띄운다.
// → 그 요청에만 `authPrompt: true` 를 붙인다. 기본값은 조용히 실패.
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 인증 실패 시 사용자에게 토스트를 띄울지. 사용자 액션에서 시작된 요청만 true. */
    authPrompt?: boolean;
  }
}

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/** 토큰이 없으면 애초에 보낼 수 없는 요청. */
const requiresAuth = (url?: string): boolean =>
  !!url && (url.includes('bookmarks') || url.includes('user'));

const promptLogin = (message: string) => {
  Toast.show({
    type: 'info',
    text1: message,
    visibilityTime: 3000,
    autoHide: true,
  });
};

instance.interceptors.request.use(
  async (config) => {
    const accessToken = await getToken();
    if (accessToken) {
      config.headers.Authorization = `${accessToken}`;
    } else if (requiresAuth(config.url)) {
      // 토큰 없이 인증 API 를 부르는 건 언제나 실패다. 다만 조용히 실패시킨다.
      if (config.authPrompt) {
        promptLogin('로그인이 필요한 서비스입니다.');
      }
      return Promise.reject(new Error('No Token'));
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

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

    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      const newAccessToken = await tokenRefresh();
      if (!newAccessToken) {
        // 세션은 정리하되, 토스트는 사용자가 시작한 요청에서만.
        // 화면 진입 시 자동으로 나가는 요청의 401 은 비로그인의 정상 결과다.
        await AsyncStorage.clear();
        if (originalRequest.authPrompt) {
          promptLogin('로그인을 해주세요.');
        }
        return Promise.reject(new Error('리프레시 실패, 재로그인 필요'));
      }

      originalRequest.headers.Authorization = newAccessToken;
      return instance(originalRequest);
    }

    return Promise.reject(error);
  }
);


export default instance;
