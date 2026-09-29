import { useMemo } from 'react';
import { AuthRepository } from '../../../model/repository/AuthRepository';
import { NaverAuthDataSource } from '../../../model/DataSource/NaverDataSource';
import { GoogleAuthDataSource } from '../../../model/DataSource/GoogleDataSource';
import { KakaoAuthDataSource } from '../../../model/DataSource/KakaoDataSource';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, AuthErrorType } from '../../../model/domain/AuthError';
import { AuthRemoteDataSource } from '../../../model/DataSource/AuthRemoteDataSource';
import { AppleDataSource } from '../../../model/DataSource/AppleDataSource';
import { syncSentryUser } from '../../../tokenRequest/Token';

/** 로그인 결과의 토큰을 저장하고 Sentry user 를 맞춘다. 4개 소셜 로그인이 공유한다. */
const persistTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
  await syncSentryUser(accessToken);
};

const AuthViewModel = () => {
  const repository = useMemo(
    () =>
      new AuthRepository(
        new NaverAuthDataSource(),
        new GoogleAuthDataSource(),
        new KakaoAuthDataSource(),
        new AppleDataSource(),
        new AuthRemoteDataSource(),

      ),
    []
  );

  const loginWithNaver = async () => {
    try {
      const result = await repository.naverLogin();

      if (result.type === 'token') {
        // 토큰 저장
        await persistTokens(result.accessToken, result.refreshToken);
      }

      return result;

    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        '알 수 없는 로그인 오류'
      );
    }
  };

  const loginWithKakao = async () => {
    try {
      const result = await repository.kakaoLogin();

      // 기존 회원
      if (result.type === 'token') {
        // 토큰 저장
        await persistTokens(result.accessToken, result.refreshToken);
      }
      return result;

    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        '알 수 없는 로그인 오류'
      );
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await repository.googleLogin();

      // 기존 회원
      if (result.type === 'token') {
        // 토큰 저장
        await persistTokens(result.accessToken, result.refreshToken);
      }
      return result;

    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        '알 수 없는 로그인 오류'
      );
    }
  };

  const loginWithApple = async () => {
    try {
      const result = await repository.appleLogin();

      // 기존 회원
      if (result.type === 'token') {
        // 토큰 저장
        await persistTokens(result.accessToken, result.refreshToken);
      }
      return result;

    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        '알 수 없는 로그인 오류'
      );
    }
  };

  return {
    loginWithNaver,
    loginWithKakao,
    loginWithGoogle,
    loginWithApple,
  };
};

export default AuthViewModel;
