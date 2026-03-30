import axios from 'axios';
import { ISocialAuthDataSource } from './ISocialAuthDataSource';
import { AuthResult } from '../domain/AuthResult';
import { AuthError, AuthErrorType } from '../domain/AuthError';
import { API_BASE_URL } from '@env';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export class GoogleAuthDataSource implements ISocialAuthDataSource {
  async login(): Promise<AuthResult> {
    try {
      console.log('--- [구글 로그인 시작] ---');
      await GoogleSignin.hasPlayServices();

      try { await GoogleSignin.signOut(); } catch (e) { }

      await GoogleSignin.signIn();


      const auth = await GoogleSignin.getTokens();
      const accessToken = auth.accessToken;
      const idToken = auth.idToken; // 백엔드 검증용으로 주로 idToken을 사용하므로 로그에 추가

      console.log('2. 구글 토큰 획득 성공');
      console.log('   - AccessToken:', accessToken?.substring(0, 10) + '...');
      console.log('   - IdToken:', idToken?.substring(0, 10) + '...');

      if (!accessToken) {
        throw new AuthError(AuthErrorType.TOKEN_EXPIRED, '구글 액세스 토큰 만료');
      }

      console.log(`3. 백엔드 요청 전송: ${API_BASE_URL}/api/v2/auth/social-login`);

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v2/auth/social-login`,
          {
            provider: 'google',
            accessToken: accessToken, // 만약 서버에서 idToken을 원하면 이 부분을 idToken으로 바꿔야 할 수도 있습니다.
            code: '',
            state: '',
          }
        );

        const data = response.data;
        console.log('4. 백엔드 응답 성공! 데이터:', JSON.stringify(data));

        if (data.type === 'signup') {
          return { type: 'signup', signupCode: data.code };
        }

        return {
          type: 'token',
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };

      } catch (axiosError: any) {
        // --- 여기서 백엔드 에러 원인을 분석합니다 ---
        console.error('❌ 백엔드 통신 에러 발생!');
        if (axiosError.response) {
          // 서버가 4xx, 5xx 응답을 보낸 경우
          console.error('상태 코드:', axiosError.response.status);
          console.error('서버 에러 메세지:', JSON.stringify(axiosError.response.data));
        } else if (axiosError.request) {
          // 요청은 보냈으나 응답을 못 받은 경우 (주소 틀림, 네트워크 단절)
          console.error('서버로부터 응답이 없습니다. 주소를 확인하세요.');
        } else {
          console.error('에러 설정 오류:', axiosError.message);
        }
        throw axiosError;
      }

    } catch (error: any) {
      console.error('❌ 구글 로그인 과정 최종 에러:', error);
      if (error.code === 'E_CANCELLED_OPERATION') {
        throw new AuthError(AuthErrorType.CANCELLED, '구글 로그인 취소');
      }
      throw error;
    }
  }
}
