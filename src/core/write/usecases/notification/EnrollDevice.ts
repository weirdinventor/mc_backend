import {Os} from "../../domain/types/Os";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";

import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {DeviceRepository} from "../../domain/repositories/DeviceRepository";
import {Device} from "../../domain/aggregates/Device";


export interface CreatePhoneDeviceInput {
    id: string,
    registrationToken: string,
    os: Os
}

@injectable()
export class EnrollDevice implements Usecase<CreatePhoneDeviceInput, Device> {
    constructor(
        @inject(Identifiers.deviceRepository)
        private readonly phoneRepository: DeviceRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(request: CreatePhoneDeviceInput): Promise<Device> {
        const {id, registrationToken, os} = request
        const device = Device.enroll({
            id,
            registrationToken,
            os
        })
        await this.phoneRepository.save(device)
        await this.eventDispatcher.dispatch(device)
        return device
    }
}
