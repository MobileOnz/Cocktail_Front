import axios from 'axios';
import KakaoLogin, { KakaoOAuthToken, login } from '@react-native-seoul/kakao-login';
import { ISocialAuthDataSource } from './ISocialAuthDataSource';
import { AuthResult } from '../domain/AuthResult';
import { API_BASE_URL } from '@env';
import { AuthError, AuthErrorType } from '../domain/AuthError';

export class KakaoAuthDataSource implements ISocialAuthDataSource {
  
  async getLoginUrl(): Promise< {loginUrl: string}> {
    console.log("getLoginUrl: ", API_BASE_URL)
    const response = await axios.get(
      `${API_BASE_URL}/api/v2/auth/kakao/login-url`
    );
    console.log("getLoginUrl: ", response.data)
    return response.data
  }



  async login(): Promise<AuthResult> {
    try {
      const auth: KakaoOAuthToken = await login()
      console.log(JSON.stringify(auth), {API_BASE_URL})

      const accessToken = auth.accessToken

      if (!accessToken) {
        throw new AuthError(
          AuthErrorType.TOKEN_EXPIRED,
            "카카오 액세스 토큰 만료"
        );
      }
      console.log('accessToken', accessToken)
      const response = await axios.post(
        `${API_BASE_URL}/api/v2/auth/social-login`,
        {
          provider: 'kakao',
          accessToken: accessToken,
          code: "",
          state: "",
        }
      );
      
      const data = response.data
      console.log("카카오 로그인 - 백엔드 응답값: " + data.accessToken)
      // 신규 회원
      if (data.type === 'signup') {
        return {
          type: 'signup',
          signupCode: data.code,
        };
      }

      //기존 회원
      return {
        type: 'token',
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };

    } catch (error: any) {
      if (error.code === 'E_CANCELLED_OPERATION') {
        throw new Error('카카오 로그인 취소');
      }
      throw error;
    }
  }
}