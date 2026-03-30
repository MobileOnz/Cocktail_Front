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

      const accessToken = auth.accessToken;

      if (!accessToken) {
        throw new AuthError(
          AuthErrorType.TOKEN_EXPIRED,
          '카카오 액세스 토큰 만료'
        );
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/v2/auth/social-login`,
        {
          provider: 'kakao',
          accessToken: accessToken,
          code: '',
          state: '',
        }
      );

      const data = response.data;

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
      throw error;
    }
  }
}
