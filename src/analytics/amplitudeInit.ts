import * as amplitude from '@amplitude/analytics-react-native';
import { SessionReplayPlugin } from '@amplitude/plugin-session-replay-react-native';

let initialized = false;

export async function initAmplitude() {
    if (initialized) { return; }
    try {
        await amplitude.init('88d60d2a7c94703265b642f8f16b09f0',
            undefined,
            {
                disableCookies: true,
            }
        ).promise;

        await amplitude.add(new SessionReplayPlugin()).promise;

        initialized = true;
    } catch (e) {
        console.warn('init failed:', e);
    }
}
