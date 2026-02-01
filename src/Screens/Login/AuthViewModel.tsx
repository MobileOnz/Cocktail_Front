import { useMemo } from 'react';
import { AuthRepository } from '../../model/repository/AuthRepository';
import { NaverAuthDataSource } from '../../model/DataSource/NaverDataSource';
import { GoogleAuthDataSource } from '../../model/DataSource/GoogleDataSource';
import { KakaoAuthDataSource } from '../../model/DataSource/KakaoDataSource';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, AuthErrorType } from '../../model/domain/AuthError';
import { AuthRemoteDataSource } from '../../model/DataSource/AuthRemoteDataSource';

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

      if (result.type === 'token') {
        // 토큰 저장
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
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
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
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

      if (result.type === 'token') {
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
      }
      return result;

    } catch (error: any) {
      console.log('======= 🔍 loginWithGoogle ERROR TRACE =======');

      // 1. AuthError인 경우 (이미 가공된 에러)
      if (error instanceof AuthError) {
        console.log('Type:', error.type);
        console.log('Message:', error.message);
        throw error;
      }

      // 2. AuthError가 아닌 일반 에러인 경우 (진짜 범인)
      console.error('Raw Error Object:', error); // 에러 객체 통째로 출력

      // 만약 Axios 에러라면 더 상세히 출력
      if (error.isAxiosError) {
        console.error('Axios Error Status:', error.response?.status);
        console.error('Axios Error Data:', error.response?.data);
      }

      // 기존의 '알 수 없는 로그인 오류' 대신 실제 메시지를 담아서 던집니다.
      throw new AuthError(
        AuthErrorType.SERVER_ERROR,
        error.message || '상세 메시지 없음'
      );
    }
  };

  return {
    loginWithNaver,
    loginWithKakao,
    loginWithGoogle,
  };
};

export default AuthViewModel;
