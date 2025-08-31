import {Os} from "../../core/write/domain/types/Os";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface PhoneProperties {
    id : string,
    registrationToken:string,
    uniqueId:string,
    os:Os
}

@DecoratedEvent({
    name: 'DEVICE_ENROLLED',
    namespace: 'moula-club',
    version: 1,
})

export class DeviceEnrolled implements DomainEvent {
    id = v4()
    props: PhoneProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: PhoneProperties) {
        this.props = props;
    }
}