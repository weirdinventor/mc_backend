import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface HlsStreamStoppedProperties {
    id: string
}


@DecoratedEvent({
    name: "HLS_STREAM_STOPPED",
    namespace: "moula-club",
    version: 1,
})
export class HlsStreamStopped implements DomainEvent {

    id = v4();
    props: HlsStreamStoppedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: HlsStreamStoppedProperties) {
        this.props = props;
    }
}