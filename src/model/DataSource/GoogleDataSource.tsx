import axios from "axios";
import { ISocialAuthDataSource } from "./ISocialAuthDataSource";
import { AuthResult } from "../domain/AuthResult";
import { AuthError, AuthErrorType } from "../domain/AuthError";
import { API_BASE_URL } from "@env";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export class GoogleAuthDataSource implements ISocialAuthDataSource {
  async login(): Promise<AuthResult> {
    try {
      const auth = await GoogleSignin.getTokens()
      console.log(JSON.stringify(auth), {API_BASE_URL})
      const accessToken = auth.accessToken

      if (!accessToken) {
        throw new AuthError(
          AuthErrorType.TOKEN_EXPIRED,
            "구글 액세스 토큰 만료"
        );
      }
      console.log('accessToken', accessToken)
      const response = await axios.post(
        `${API_BASE_URL}/api/v2/auth/social-login`,
        {
          provider: 'google',
          accessToken: accessToken,
          code: "",
          state: "",
        }
      );
      
      const data = response.data
      console.log("구글 로그인 - 백엔드 응답값: " + data.accessToken)
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
        throw new Error('구글 로그인 취소');
      }
      throw error;
    }
  }
}
