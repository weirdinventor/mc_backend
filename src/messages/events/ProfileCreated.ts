import {v4} from "uuid";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";
import {UserGender} from "../../core/write/domain/types/UserGender";


export interface ProfileCreatedProperties {
    id : string,
    firstname : string,
    lastname : string,
    username : string,
    gender : UserGender
}

@DecoratedEvent({
    name: 'PROFILE_CREATED',
    namespace: 'moula-club',
    version: 1,
})
export class ProfileCreated implements DomainEvent {
    id = v4()
    props: ProfileCreatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: ProfileCreatedProperties) {
        this.props = props;
    }
}
