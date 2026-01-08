import { API_BASE_URL } from "@env";
import axios from "axios";


export class MonitoriingDataSouce {
    async getUserStatus(deviceId: string): Promise<{ isOnboarded: boolean }> {
        try {
            const result = await axios.get(`${API_BASE_URL}/api/v2/monitoring/onboarding/status`, {
                params: { deviceNumber: deviceId },
            });
            return result.data.onboardingCompleted;
        } catch (error) {
            throw error;
        }
    }
    async postUserInfo(deviceNumber: string, gender: string, ageRange: string) {
        try {
            await axios.post(`${API_BASE_URL}/api/v2/monitoring/onboarding`, {
                params: {
                    deviceNumber,
                    gender,
                    ageRange
                }
            })

        } catch (error) {
            throw error;
        }

    }
}