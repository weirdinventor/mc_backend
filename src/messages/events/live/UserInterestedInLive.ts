import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface UserInterestedInLiveProperties {
    id: string
}


@DecoratedEvent({
    name: "USER_INTERESTED_IN_LIVE",
    namespace: "moula-club",
    version: 1,
})
export class UserInterestedInLive implements DomainEvent {

    id = v4();
    props: UserInterestedInLiveProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: UserInterestedInLiveProperties) {
        this.props = props;
    }
}