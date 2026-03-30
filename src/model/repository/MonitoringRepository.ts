import { MonitoriingDataSouce } from '../DataSource/MonitoringDataSource';

export interface IMonitoringRepository {
    checkOnboardingStatus(deviceId: string): Promise<boolean>;
}

export class MonitoringRepository implements IMonitoringRepository {
    private dataSource: MonitoriingDataSouce;

    constructor(dataSource?: MonitoriingDataSouce) {
        this.dataSource = dataSource ?? new MonitoriingDataSouce();
    }

    async checkOnboardingStatus(deviceId: string): Promise<boolean> {
        console.log(`[MonitoringRepo] 상태 확인 시작 - DeviceId: ${deviceId}`); // 호출 시작 확인

        try {
            const data = await this.dataSource.getUserStatus(deviceId);

            // 1. 서버 응답 데이터 전체 구조 확인
            console.log('[MonitoringRepo] 서버 응답 데이터:', JSON.stringify(data, null, 2));

            // 2. 응답이 null이나 undefined인 경우 체크
            if (!data) {
                console.warn('[MonitoringRepo] 경고: 데이터 소스로부터 빈(null/undefined) 응답을 받았습니다.');
                return false;
            }

            // 3. isOnboarded 필드 존재 여부 및 값 확인
            console.log('[MonitoringRepo] isOnboarded 필드 값:', data.isOnboarded);

            // API 설계에 따라 data.data.isOnboarded 처럼 깊은 구조일 수 있으므로 확인 필요
            const result = data?.isOnboarded ?? false;

            console.log(`[MonitoringRepo] 최종 반환값: ${result}`);
            return result;

        } catch (error: any) {
            // 4. 에러 발생 시 상세 정보 출력
            console.error('-------------------------------------------');
            console.error('[MonitoringRepo] 온보딩 상태 확인 중 에러 발생!');
            console.error('- 에러 메시지:', error?.message);

            // API 에러인 경우 서버 응답 메시지 출력 (예: axios 사용 시)
            if (error?.response) {
                console.error('- 서버 에러 응답:', error.response.data);
                console.error('- 상태 코드:', error.response.status);
            }

            console.error('- 에러 스택:', error?.stack);
            console.error('-------------------------------------------');

            return false;
        }
    }
}
