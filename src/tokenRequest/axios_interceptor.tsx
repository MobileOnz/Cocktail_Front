import { API_BASE_URL } from '@env';
import { getToken, tokenRefresh } from './Token';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

instance.interceptors.request.use(

  async (config) => {
    const accessToken = await getToken();
    if (accessToken) {
      config.headers.Authorization = `${accessToken}`;
    } else {
      if (config.url?.includes('bookmarks') || config.url?.includes('user')) {
        console.log('확인중');
        Toast.show({
          type: 'info',
          text1: '로그인이 필요한 서비스입니다.',
          visibilityTime: 3000,
        });
        return Promise.reject(new Error('No Token'));
      }
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log('헤더', config.headers);
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

    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      const newAccessToken = await tokenRefresh();
      console.log('newAccessToken', newAccessToken);
      if (!newAccessToken) {
        Toast.show({
          type: 'info',
          text1: '로그인을 해주세요.',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 60, // 너무 위에 있어서 안 보일 수 있으니 위치 조정
        });

        console.log('토스트 호출 완료');
        await AsyncStorage.clear();
        return Promise.reject(new Error('리프레시 실패, 재로그인 필요'));
      }

      originalRequest.headers.Authorization = newAccessToken;
      return instance(originalRequest);
    }

    return Promise.reject(error);
  }
);


export default instance;
