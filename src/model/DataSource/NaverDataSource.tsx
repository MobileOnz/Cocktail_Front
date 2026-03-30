import axios from 'axios';
import NaverLogin from '@react-native-seoul/naver-login';
import { ISocialAuthDataSource } from './ISocialAuthDataSource';
import { AuthResult } from '../domain/AuthResult';
import { AuthError, AuthErrorType } from '../domain/AuthError';
import { API_BASE_URL } from '@env';

export class NaverAuthDataSource implements ISocialAuthDataSource {

  async login(): Promise<AuthResult> {
    const { successResponse, failureResponse } = await NaverLogin.login();
    console.log('성공 응답: ' + JSON.stringify(successResponse), '실패 응답: ' + failureResponse);
    if (failureResponse) {
      throw new AuthError(
        AuthErrorType.SOCIAL_LOGIN_FAILED,
        '네이버 로그인 실패'
      );
    }

    if (!successResponse?.accessToken) {
      throw new AuthError(
        AuthErrorType.SOCIAL_LOGIN_FAILED,
        '네이버 accessToken 없음'
      );
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v2/auth/social-login`,
        {
          provider: 'naver',
          code: null,
          state: null,
          accessToken: successResponse.accessToken,
        }
      );

      const data = response.data;
      console.log('[Naver] 백엔드 응답:', JSON.stringify(data));

      if (data.type === 'token') {
        return {
          type: 'token',
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      }

      if (data.type === 'signup') {
        return {
          type: 'signup',
          signupCode: data.code,
        };
      }

      throw new AuthError(AuthErrorType.SERVER_ERROR, '알 수 없는 로그인 응답');

    } catch (error: any) {
      if (error instanceof AuthError) { throw error; }

      if (error.response) {
        console.error('[Naver] 백엔드 에러 status:', error.response.status);
        console.error('[Naver] 백엔드 에러 data:', JSON.stringify(error.response.data));
      } else {
        console.error('[Naver] 네트워크 에러:', error.message);
      }

      if (error.response?.status === 401) {
        throw new AuthError(AuthErrorType.TOKEN_EXPIRED, 'Access token expired');
      }

      throw new AuthError(AuthErrorType.SERVER_ERROR, '서버 오류');
    }
  }
}
