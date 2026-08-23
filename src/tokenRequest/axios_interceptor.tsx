import { API_BASE_URL } from '@env';
import { getToken, tokenRefresh } from './Token';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { navigateToLogin } from '../lib/navigationRef';

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

/**
 * 인증 때문에 거부했다는 표식을 단 에러.
 * 호출부가 "로그인 문제"와 "네트워크/서버 문제"를 구분해 다른 문구를 보여줄 수 있어야 한다.
 */
const authRejection = (message: string): Error => {
  const err = new Error(message) as Error & { isAuthError?: boolean };
  err.isAuthError = true;
  return err;
};

/**
 * 로그인이 필요하다고 알리고, 로그인 화면까지 데려간다.
 *
 * 예전에는 토스트만 띄웠다. 사용자가 '로그인이 필요하다'는 사실은 알아도
 * 로그인 화면이 우상단 메뉴 안에 있어서 스스로 찾아가야 했다(데모 QA 지적).
 * 토스트는 이유를 설명하는 용도로 남기고, 이동은 여기서 처리한다.
 */
const promptLogin = (message: string) => {
  Toast.show({
    type: 'info',
    text1: message,
    visibilityTime: 3000,
    autoHide: true,
  });
  navigateToLogin();
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
      return Promise.reject(authRejection('No Token'));
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
        await AsyncStorage.clear();
        // 리프레시까지 실패했다면 '비로그인'이 아니라 '쓰던 세션이 끊긴' 것이다.
        // 이 경우엔 authPrompt 여부와 무관하게 로그인으로 보낸다 —
        // 그러지 않으면 만들어봤어요·문의·리액션이 저마다 다른 문구로 조용히 실패하고
        // 사용자는 로그인이 문제라는 걸 알 방법이 없다(실제 QA 에서 그렇게 나왔다).
        promptLogin('로그인이 만료됐어요. 다시 로그인해주세요.');
        return Promise.reject(authRejection('리프레시 실패, 재로그인 필요'));
      }

      originalRequest.headers.Authorization = newAccessToken;
      return instance(originalRequest);
    }

    return Promise.reject(error);
  }
);


export default instance;
