import {RecordStatus} from "../../../core/write/domain/types/RecordStatus";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface RecordUpdatedProperties {
    title: string;
    description: string;
    thumbnail?: string;
    status: RecordStatus;
}

@DecoratedEvent({
    name: "RECORD_UPDATED",
    version: 1,
    namespace: "moula-club"
})
export class RecordUpdated implements DomainEvent {
    id = v4();
    props: RecordUpdatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata

    constructor(props: RecordUpdatedProperties) {
        this.props = props;
    }
}