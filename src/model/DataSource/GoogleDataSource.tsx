import axios from 'axios';
// import NaverLogin from "@react-native-seoul/naver-login";
import { ISocialAuthDataSource } from './ISocialAuthDataSource';
import { AuthResult } from '../domain/AuthResult';
import { AuthError, AuthErrorType } from '../domain/AuthError';
import { API_BASE_URL } from '@env';

export class GoogleAuthDataSource implements ISocialAuthDataSource {

  async getLoginUrl(): Promise<{ loginUrl: string }> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v2/auth/google/login-url`
    );
    console.log('getLoginUrl: ', response.data);
    return response.data;
  }

  async login(): Promise<AuthResult> {
    throw new AuthError(
      AuthErrorType.SERVER_ERROR,
      '서버 오류'
    );
  }
}
