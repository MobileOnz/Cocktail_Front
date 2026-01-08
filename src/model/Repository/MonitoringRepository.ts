import { MonitoriingDataSouce } from "../DataSource/MonitoringDataSource";

export interface IMonitoringRepository {
    checkOnboardingStatus(deviceId: string): Promise<boolean>;
}

export class MonitoringRepository implements IMonitoringRepository {
    private dataSource: MonitoriingDataSouce;

    constructor(dataSource?: MonitoriingDataSouce) {
        this.dataSource = dataSource ?? new MonitoriingDataSouce();
    }

    async checkOnboardingStatus(deviceId: string): Promise<boolean> {
        const dtoRaw = await this.dataSource.getUserStatus(deviceId);

        return dtoRaw?.isOnboarded ?? false;
    }
}