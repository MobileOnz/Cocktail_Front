import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '@env';
import * as Sentry from '@sentry/react-native';

/**
 * accessToken 가져오기
 */
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('accessToken');
}

/**
 * 현재 accessToken 을 기준으로 Sentry user 를 맞춘다.
 * 인자를 주면 그 토큰을, 없으면 저장된 토큰을 쓴다. null 을 주면 로그아웃으로 보고 비운다.
 * 로그인/로그아웃/토큰 갱신/앱 부팅 시점에 호출한다.
 */
export async function syncSentryUser(token?: string | null): Promise<void> {
  try {
    const t = token === undefined ? await getToken() : token;
    if (!t) {
      Sentry.setUser(null);
      return;
    }
    const decoded: any = jwtDecode(t);
    const id = decoded.sub ?? decoded.userId ?? decoded.memberId ?? decoded.id;
    Sentry.setUser(id ? { id: String(id) } : null);
  } catch {
    // 토큰이 JWT 가 아니거나 파싱 실패 — user 태깅은 선택사항이므로 조용히 넘어간다.
  }
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

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      console.log('[Token] 재발급 성공:', { accessToken: '받음', refreshToken: '받음' });
      if (!accessToken || !newRefreshToken) {
        console.error('access 또는 refresh 토큰이 응답에 없습니다.');
        return null;
      }

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await syncSentryUser(accessToken);

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
