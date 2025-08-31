import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface UserBlockedProperties {
    userId: string,
    blockedUserId: string
}

@DecoratedEvent({
    name: "USER_BLOCKED",
    version: 1,
    namespace: "moula_club"
})

export class UserBlocked implements DomainEvent {

    id = v4()
    props: UserBlockedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(
        props: UserBlockedProperties
    ) {
        this.props = props
    }

}