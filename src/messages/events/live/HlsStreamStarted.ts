import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface HlsStreamStartedProperties {
    id: string
}


@DecoratedEvent({
    name: "HLS_STREAM_STARTED",
    namespace: "moula-club",
    version: 1,
})
export class HlsStreamStarted implements DomainEvent {

    id = v4();
    props: HlsStreamStartedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: HlsStreamStartedProperties) {
        this.props = props;
    }
}