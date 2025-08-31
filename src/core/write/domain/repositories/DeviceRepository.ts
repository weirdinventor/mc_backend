import {Device} from "../aggregates/Device";


export interface DeviceRepository {
    save(phone: Device): Promise<void>;

    getById(id: string): Promise<Device>;

    getRegistrationTokens(ids: string[]): Promise<string[]>;
}