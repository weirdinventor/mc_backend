import {injectable} from "inversify";
import {DeviceRepository} from "../../../core/write/domain/repositories/DeviceRepository";
import {DeviceEntityMapper} from "./mappers/DeviceEntityMapper";
import {DeviceEntity} from "../entities/DeviceEntity";
import {Device} from "../../../core/write/domain/aggregates/Device";
import {DeviceErrors} from "../../../core/write/domain/errors/DeviceErrors";


@injectable()
export class PostgresDeviceRepository implements DeviceRepository {
    private _phoneEntityMapper: DeviceEntityMapper

    constructor(
        private readonly entityManager: any
    ) {
        this._phoneEntityMapper = new DeviceEntityMapper(this.entityManager)
    }

    async save(phone: Device): Promise<void> {
        const phoneRepo = this.entityManager.getRepository(DeviceEntity)
        const phoneEntity = this._phoneEntityMapper.fromDomain(phone)
        await phoneRepo.save(phoneEntity)
    }

    async getById(id: string): Promise<Device> {
        const phoneRepo = this.entityManager.getRepository(DeviceEntity)
        const phoneEntity = await phoneRepo.findOne({
            where: {
                id
            }
        })
        if (!phoneEntity) {
            //throw new DeviceErrors.DeviceNotFound()
            //
            console.log('[WARNING] Device not found.')
            return null
        }
        return this._phoneEntityMapper.toDomain(phoneEntity)
    }

    async getRegistrationTokens(ids: string[]): Promise<string[]> {

        const deviceRepo = this.entityManager.getRepository(DeviceEntity)

        if (!ids.length) {
            return []
        }


        const tokens = await deviceRepo.createQueryBuilder('device')
            .select('device.registrationToken', "token")
            .where('device.id IN (:...ids)', {ids})
            .getRawMany()

        return tokens.map((raw: any) => raw.token)
    }

}