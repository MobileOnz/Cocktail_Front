import { Identify } from '@amplitude/analytics-react-native';
import * as amplitude from '@amplitude/analytics-react-native';
import { Platform } from 'react-native';

export function setBaseUserProperties(params: {
    loginYn: boolean;
    userId?: number;
    gender?: string;
    birthYear?: string;
    generation?: string;
}) {
    const identify = new Identify();

    identify.set('login_yn', params.loginYn);
    identify.set('user_id', params.userId ?? 0);
    identify.set('user_device', Platform.OS);

    if (params.gender) {
        identify.set('user_gender', params.gender);
    }

    if (params.birthYear) {
        identify.set('user_birth_year', params.birthYear);
    }

    if (params.generation) {
        identify.set('user_generation', params.generation);
    }

    amplitude.identify(identify);
}
