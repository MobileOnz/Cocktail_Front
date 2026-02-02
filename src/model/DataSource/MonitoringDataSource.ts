import instance from '../../tokenRequest/axios_interceptor';


export class MonitoriingDataSouce {
    async getUserStatus(deviceId: string): Promise<{ isOnboarded: boolean }> {
        try {
            const result = await instance.get('/api/v2/monitoring/onboarding/status', {
                params: { deviceNumber: deviceId },
            });
            return {
                isOnboarded: result.data.onboardingCompleted,
            };
        } catch (error) {
            throw error;
        }
    }
    async postUserInfo(deviceNumber: string, gender: string, ageRange: string) {
        try {
            await instance.post('/api/v2/monitoring/onboarding', {
                params: {
                    deviceNumber,
                    gender,
                    ageRange,
                },
            });

        } catch (error) {
            throw error;
        }

    }
}
