import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '@env';

/**
 * accessToken 가져오기
 */
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('accessToken');
}

/**
 * accessToken 만료 여부 확인
 */
export async function isTokenExpired(): Promise<boolean> {
  const token = await getToken();
  if (!token) { return true; }

  try {
    const decoded: any = jwtDecode(token);
    const exp = decoded.exp * 1000;
    return Date.now() > exp;
  } catch {
    return true;
  }
}

let isRefreshing = false; //중복확인
let refreshPromise: Promise<string | null> | null = null;

export async function tokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      console.log('보내는 refresh token:', refreshToken);

      if (!refreshToken) {
        console.log('리프레시 토큰이 없습니다.');
        return null;
      }

      const response = await axios.post(`${API_BASE_URL}/api/v2/auth/reissue`, null, {
        headers: {
          'RefreshToken': refreshToken,
        },
      });

      console.log('[Token] reissue 응답 전체:', JSON.stringify(response.data));

      // flat 구조 ({ accessToken, refreshToken }) 또는 중첩 구조 ({ data: { accessToken, refreshToken } }) 모두 대응
      const payload = response.data?.accessToken ? response.data : response.data?.data;
      const accessToken = payload?.accessToken;
      const newRefreshToken = payload?.refreshToken;

      console.log('[Token] 재발급 결과:', { accessToken: accessToken ? '받음' : '없음', refreshToken: newRefreshToken ? '받음' : '없음' });
      if (!accessToken || !newRefreshToken) {
        console.error('[Token] access 또는 refresh 토큰이 응답에 없습니다. payload:', JSON.stringify(payload));
        return null;
      }

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);

      return accessToken;
    } catch (error: any) {
      try {
        const token = error.response?.data?.data?.access_token;
        const refresh = error.response?.data?.data?.refresh_token;
        if (token && refresh) {
          await AsyncStorage.setItem('accessToken', token);
          await AsyncStorage.setItem('refreshToken', refresh);
          console.log('🛠 catch 내에서 토큰 복구됨');
          return token;
        }
      } catch (e) {
        console.log('❌ catch 내 복구 로직 실패', e);
      }

      const status = error.response?.status;
      if (status === 401 || status === 403) {
        console.warn('⚠️ 리프레시 토큰 만료됨 (로그아웃 필요)');
      } else {
        console.error('❌ 토큰 갱신 중 예외:', error);
      }
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
