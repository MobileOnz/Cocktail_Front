import axios from 'axios';
import { KakaoOAuthToken, login } from '@react-native-seoul/kakao-login';
import { ISocialAuthDataSource } from './ISocialAuthDataSource';
import { AuthResult } from '../domain/AuthResult';
import { API_BASE_URL } from '@env';
import { AuthError, AuthErrorType } from '../domain/AuthError';

export class KakaoAuthDataSource implements ISocialAuthDataSource {
  async login(): Promise<AuthResult> {
    try {
      const auth: KakaoOAuthToken = await login();
      console.log(JSON.stringify(auth), { API_BASE_URL });

      const accessToken = auth.accessToken;

      if (!accessToken) {
        throw new AuthError(
          AuthErrorType.TOKEN_EXPIRED,
          '카카오 액세스 토큰 만료'
        );
      }
      console.log('accessToken', accessToken);
      let response;
      try {
        response = await axios.post(
          `${API_BASE_URL}/api/v2/auth/social-login`,
          {
            provider: 'kakao',
            accessToken: accessToken,
            code: '',
            state: '',
          }
        );
      } catch (axiosError: any) {
        if (axiosError.response) {
          console.error('[Kakao] 백엔드 에러 status:', axiosError.response.status);
          console.error('[Kakao] 백엔드 에러 data:', JSON.stringify(axiosError.response.data));
        } else {
          console.error('[Kakao] 네트워크 에러:', axiosError.message);
        }
        throw axiosError;
      }

      const data = response.data;
      console.log('[Kakao] 백엔드 응답:', JSON.stringify(data));

      if (data.type === 'signup') {
        return { type: 'signup', signupCode: data.code };
      }

      return {
        type: 'token',
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };

    } catch (error: any) {
      if (error.code === 'E_CANCELLED_OPERATION') {
        throw new AuthError(AuthErrorType.CANCELLED, '카카오 로그인 취소');
      }
      console.error('[Kakao] SDK 에러 code:', error.code);
      console.error('[Kakao] SDK 에러 message:', error.message);
      console.error('[Kakao] SDK 에러 full:', JSON.stringify(error));
      throw error;
    }
  }
}
