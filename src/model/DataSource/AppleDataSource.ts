import axios from 'axios';
import { AuthResult } from '../domain/AuthResult';
import { ISocialAuthDataSource } from './ISocialAuthDataSource';
import { API_BASE_URL } from '@env';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import DeviceInfo from 'react-native-device-info';
import { AuthError, AuthErrorType } from '../domain/AuthError';

export class AppleDataSource implements ISocialAuthDataSource {
    async login(): Promise<AuthResult> {



        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            const { identityToken } = appleAuthRequestResponse;

            if (!identityToken) {
                throw new Error('애플 인증 토큰(identityToken)이 없습니다.');
            }

            console.log('Apple identityToken:', identityToken);

            const deviceNumber = await DeviceInfo.getUniqueId();

            const response = await axios.post(
                `${API_BASE_URL}/api/v2/auth/social-login`,
                {
                    provider: 'apple',
                    accessToken: identityToken,
                    deviceNumber,
                    code: '',
                    state: '',
                }
            );

            const data = response.data;
            console.log('[Apple] 백엔드 전체 응답:', JSON.stringify(data));

            if (data.type === 'signup') {
                return {
                    type: 'signup',
                    signupCode: data.tempCode ?? data.code,
                };
            }

            return {
                type: 'token',
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            };

        } catch (error: any) {
            if (error.code === appleAuth.Error.CANCELED) {
                throw new AuthError(AuthErrorType.CANCELLED, '애플 로그인 취소');
            }

            if (error.response) {
                console.error('[Apple] 백엔드 에러 status:', error.response.status);
                console.error('[Apple] 백엔드 에러 data:', JSON.stringify(error.response.data));
            } else {
                console.error('[Apple] 에러:', error.message ?? error);
            }
            throw error;
        }
    }
}
