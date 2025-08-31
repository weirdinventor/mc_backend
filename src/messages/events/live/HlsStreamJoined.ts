import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface HlsStreamJoinedProperties {
    id: string
}


@DecoratedEvent({
    name: "HLS_STREAM_JOINED",
    namespace: "moula-club",
    version: 1,
})
export class HlsStreamJoined implements DomainEvent {

    id = v4();
    props: HlsStreamJoinedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: HlsStreamJoinedProperties) {
        this.props = props;
    }
}