import {v4} from "uuid";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";

export interface LiveOngoingProperties {
    id: string
}

@DecoratedEvent({
    name: "LIVE_ONGOING",
    namespace: "moula-club",
    version: 1,
})
export class LiveOngoing implements DomainEvent {
    id = v4();
    props: LiveOngoingProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: LiveOngoingProperties) {
        this.props = props;
    }
}
