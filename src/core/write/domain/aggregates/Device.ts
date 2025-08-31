import {AggregateRoot} from "../entities/AggregateRoot";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {UniqueId} from "../valueObject/UniqueId";
import {DeviceEnrolled} from "../../../../messages/events/DeviceEnrolled";
import {Os} from "../types/Os";



export interface DeviceProperties {
    id: string,
    uniqueId:string,
    registrationToken: string,
    os: Os
}

export class Device extends AggregateRoot<DeviceProperties> {
    static restore(props: DeviceProperties) {
        return new Device(props);
    }

    static enroll(payload: { id: string, registrationToken: string, os: Os }) {
        const {id, registrationToken, os} = payload
        const phone = new Device({
            id,
            registrationToken,
            uniqueId:new UniqueId(registrationToken).value,
            os
        })

        phone.applyChange(
            new DeviceEnrolled({
                id,
                registrationToken,
                uniqueId:new UniqueId(registrationToken).value,
                os
            }));
        return phone;
    }


    @Handle(DeviceEnrolled)
    private applyPhoneCreated(event: DeviceEnrolled) {
        this.props.id = event.props.id;
        this.props.registrationToken = event.props.registrationToken;
        this.props.os = event.props.os;
    }

}