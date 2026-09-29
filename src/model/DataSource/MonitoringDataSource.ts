import instance from '../../tokenRequest/axios_interceptor';


export class MonitoriingDataSouce {
    async getUserStatus(deviceId: string): Promise<{ isOnboarded: boolean }> {
        try {
            const result = await instance.get('/api/v2/monitoring/onboarding/status', {
                params: { deviceNumber: deviceId },
            });
            // 응답 봉투는 { code, msg, data }. 한 겹 더 벗겨야 한다.
            return {
                isOnboarded: result.data?.data?.onboardingCompleted ?? false,
            };
        } catch (error) {
            throw error;
        }
    }
    async postUserInfo(deviceNumber: string, gender: string, ageRange: string) {
        try {
            // 서버는 평평한 JSON body 를 받는다. params 로 감싸면 필드가 전부 null 로 들어간다.
            await instance.post('/api/v2/monitoring/onboarding', {
                deviceNumber,
                gender,
                ageRange,
            });

        } catch (error) {
            throw error;
        }

    }
}
