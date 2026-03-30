import { useCallback, useState } from 'react';
import { getUniqueId } from 'react-native-device-info';
import Toast from 'react-native-toast-message';

import instance from '../../tokenRequest/axios_interceptor';

interface UseOnboardingProps {
    onComplete: () => void;
}

const UseOnboarindViewModel = ({ onComplete }: UseOnboardingProps) => {
    const [gender, setGender] = useState<string>(''); // 'female', 'male', 'none'
    const [ageRange, setAgeRange] = useState<string>(''); // '19이하', '20-24세' 등
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const ageOptions = [
        { label: '19세 이하', value: '19_under' }, // 서버 규격에 맞춰 '19_under' 등 확인 필요
        { label: '20-24세', value: '20_24' },
        { label: '25-29세', value: '25_29' },
        { label: '30-34세', value: '30_34' },
        { label: '35-39세', value: '35_39' },
        { label: '40세 이상', value: '40_over' },
    ];

    const postUserInfo = useCallback(async () => {
        if (!gender || !ageRange) {
            Toast.show({
                type: 'error',
                text1: '선택 미완료',
                text2: '성별과 연령대를 모두 선택해주세요.',
            });
            return;
        }

        const handleSuccess = () => {
            Toast.show({
                type: 'success',
                text1: '등록 완료',
                text2: '정보가 성공적으로 저장되었습니다.',
            });
            onComplete();
        };

        setIsLoading(true);

        try {

            const deviceId = await getUniqueId();
            const payload = {
                deviceNumber: deviceId,
                gender: gender,
                ageRange: ageRange,
            };

            const response = await instance.post('/api/v2/monitoring/onboarding', payload);
            if (response.status === 200 || response.status === 201) {
                handleSuccess();
            }
        } catch (error: any) {
            console.log('--- 온보딩 catch 진입 ---');
            setIsLoading(false);

            let errorMessage = '서버 통신 중 문제가 발생했습니다.';

            if (error.response) {
                // 1. 서버가 응답을 준 경우 (400, 500 등)
                const statusCode = error.response.status;
                // 서버 응답 구조에 따라 error.response.data.message 혹은 .error 등을 확인해야 합니다.
                const serverDetail = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data);

                errorMessage = `[${statusCode}] ${serverDetail}`;
                console.log('Server Error Data:', error.response.data);
            } else if (error.request) {
                // 2. 요청은 보냈으나 응답이 없는 경우 (네트워크 에러, 타임아웃)
                errorMessage = '서버로부터 응답이 없습니다. 네트워크 상태를 확인해주세요.';
                console.log('No Response from Server (Network Error)');
            } else {
                // 3. 요청 설정 중 에러 발생 등 기타 에러
                errorMessage = error.message;
            }

            Toast.show({
                type: 'error',
                text1: '오류 상세 정보',
                text2: errorMessage, // 실제 오류 내용이 토스트에 찍힙니다.
                visibilityTime: 4000, // 정보가 기니까 조금 더 오래 띄웁니다.
            });
        }
    }, [gender, ageRange, onComplete]);


    return {
        gender,
        setGender,
        ageRange,
        setAgeRange,
        ageOptions,
        postUserInfo,
        isLoading,
    };
};

export default UseOnboarindViewModel;
