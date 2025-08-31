import {v4} from "uuid";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface ProfilePictureAddedProperties {
    url : string,
}

@DecoratedEvent({
    name: 'PROFILE_PICTURE_ADDED',
    namespace: 'moula-club',
    version: 1,
})
export class ProfilePictureAdded implements DomainEvent {
    id = v4()
    props: ProfilePictureAddedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: ProfilePictureAddedProperties) {
        this.props = props;
    }
}
