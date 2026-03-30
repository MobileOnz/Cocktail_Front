import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, AuthErrorType } from '../../../model/domain/AuthError';
import { AuthRemoteDataSource } from '../../../model/DataSource/AuthRemoteDataSource';
import { SignUpRequest } from '../../../model/domain/SignupRequest';

const SignUpViewModel = () => {
  // signUp만 필요하므로 AuthRemoteDataSource만 사용
  const remoteDataSource = useMemo(() => new AuthRemoteDataSource(), []);

  const signUp = async (request: SignUpRequest) => {
    try {
      const result = await remoteDataSource.signUp(request);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('refreshToken', result.refreshToken);
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

  return { signUp };
};

export default SignUpViewModel;
