import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {EntityManager} from "typeorm";
import {Device} from "../../../../core/write/domain/aggregates/Device";
import {DeviceEntity} from "../../entities/DeviceEntity";

export class DeviceEntityMapper implements Mapper<DeviceEntity, Device> {
    constructor(
        private readonly entityManager: EntityManager
    ) {
    }

    fromDomain(param: Device): DeviceEntity {
        return this.entityManager.create(DeviceEntity, {
            id: param.id,
            uniqueId:param.props.uniqueId,
            registrationToken:param.props.registrationToken,
            os:param.props.os,
            createdAt: param.createdAt,
            updatedAt: param.updatedAt,
        })
    }

    toDomain(raw: DeviceEntity): Device {
        const phone = Device.restore({
            id: raw.id,
            os:raw.os,
            uniqueId:raw.uniqueId,
            registrationToken: raw.registrationToken,
        })
        phone.createdAt = raw.createdAt;
        phone.updatedAt = raw.updatedAt;
        return phone;
    }
}