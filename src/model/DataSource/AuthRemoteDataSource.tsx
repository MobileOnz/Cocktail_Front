import { SignUpRequest } from "../domain/SignupRequest";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { SignUpResponse } from "../domain/SignupResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class AuthRemoteDataSource {

  async signUp(req: SignUpRequest): Promise<SignUpResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v2/auth/signup`,
        req
      );
      console.log(JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('signup error:', error.response?.data || error);

      throw error;
    }
  }

  async logOut(): Promise<number> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log(accessToken, '12');
      const response = await axios.post(
        `${API_BASE_URL}/api/v2/auth/logout`,
        {},
        {
          headers: {
            Authorization: `${accessToken}`,
          },
        }
      );
      console.log('AuthRemoteDataSource 로그아웃 성공', response.status);
      // 필요 시 로컬 스토리지 토큰 삭제
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      return response.status;
    } catch (error: any) {
      console.error('AuthRemoteDataSource 로그아웃 실패:', error.response?.data || error);
      throw error;
    }
  }
}
