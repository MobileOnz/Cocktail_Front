import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import React, { useCallback, useState } from 'react'
import { getUniqueId } from 'react-native-device-info';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../Navigation/Navigation';
import { API_BASE_URL } from '@env';
import instance from '../../tokenRequest/axios_interceptor';

const UseOnboarindViewModel = () => {

    const [gender, setGender] = useState<string>(''); // 'female', 'male', 'none'
    const [ageRange, setAgeRange] = useState<string>(''); // '19이하', '20-24세' 등
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
                text2: '성별과 연령대를 모두 선택해주세요.'
            });
            return;
        }

        const handleSuccess = () => {
            Toast.show({
                type: 'success',
                text1: '등록 완료',
                text2: '정보가 성공적으로 저장되었습니다.'
            });
            navigation.navigate('BottomTabNavigator', { screen: '홈' });
        };

        setIsLoading(true);

        try {

            const deviceId = await getUniqueId();
            const baseUrl = API_BASE_URL;

            const payload = {
                deviceNumber: deviceId,
                gender: gender,
                ageRange: ageRange
            };

            const response = await axios.post(`${baseUrl}/api/v2/monitoring/onboarding`, payload);

            if (response.status === 200 || response.status === 201) {
                handleSuccess();
            }
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.data?.code === -1) {
                const errorMsg = error.response.data.data;

                if (errorMsg.includes("이미 회원으로 등록된 기기")) {
                    try {
                        const deviceId = await getUniqueId();
                        const patchResponse = await instance.post(`${API_BASE_URL}/api/v2/members/onboarding`, {
                            deviceNumber: deviceId,
                            gender,
                            ageRange
                        });

                        if (patchResponse.status === 200 || patchResponse.status === 201) {
                            handleSuccess();
                            return;
                        }
                    } catch (patchError: any) {
                        console.error("PATCH 상세 에러:", patchError.response?.data || patchError.message);

                        console.error("Patch Error:", patchError);
                    }
                }
            }

            Toast.show({
                type: 'error',
                text1: '오류 발생',
                text2: '서버 통신 중 문제가 발생했습니다.'
            });
        } finally {
            setIsLoading(false);
        }
    }, [gender, ageRange, navigation]);


    return {
        gender,
        setGender,
        ageRange,
        setAgeRange,
        ageOptions,
        postUserInfo,
        isLoading
    }
}

export default UseOnboarindViewModel
