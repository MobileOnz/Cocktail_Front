import { useMemo } from "react"
import { AuthRepository } from "../../model/Repository/AuthRepository"
import { NaverAuthDataSource } from "../../model/DataSource/NaverDataSource"
import { GoogleAuthDataSource } from "../../model/DataSource/GoogleDataSource"
import { KakaoAuthDataSource } from "../../model/DataSource/KakaoDataSource"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AuthError, AuthErrorType } from "../../model/domain/AuthError"
import { AuthRemoteDataSource } from "../../model/DataSource/AuthRemoteDataSource"

const AuthViewModel = () => {
  const repository = useMemo(
    () =>
      new AuthRepository(
        new NaverAuthDataSource(),
        new GoogleAuthDataSource(),
        new KakaoAuthDataSource(),
        new AuthRemoteDataSource(),
      ),
    []
  );

  const loginWithNaver = async () => {
    try {
      const result = await repository.naverLogin();

      if (result.type === "token") {
        // 토큰 저장
        await AsyncStorage.setItem("accessToken", result.accessToken);
        await AsyncStorage.setItem("refreshToken", result.refreshToken);
      }

      return result;

    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        "알 수 없는 로그인 오류"
      );
    }
  };

  const loginWithKakao = async () => {
    try {
      const result = await repository.kakaoLogin();
      
      // 기존 회원
      if (result.type === "token") {
        // 토큰 저장
        await AsyncStorage.setItem("accessToken", result.accessToken);
        await AsyncStorage.setItem("refreshToken", result.refreshToken);
      }
      return result;
      
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        "알 수 없는 로그인 오류"
      );
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await repository.googleLogin();
      
      // 기존 회원
      if (result.type === "token") {
        // 토큰 저장
        await AsyncStorage.setItem("accessToken", result.accessToken);
        await AsyncStorage.setItem("refreshToken", result.refreshToken);
      }
      return result;
      
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        "알 수 없는 로그인 오류"
      );
    }
  }

  return { 
    loginWithNaver,
    loginWithKakao,
    loginWithGoogle
  };
};

export default AuthViewModel;