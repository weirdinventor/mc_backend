import {RecordStatus} from "../../../core/write/domain/types/RecordStatus";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface RecordCreatedProperties {
    fileUrl: string;
    status: RecordStatus;
}

@DecoratedEvent({
    name: "RECORD_CREATED",
    version: 1,
    namespace: "moula-club"
})
export class RecordCreated implements DomainEvent {
    id = v4();
    props: RecordCreatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata

    constructor(props: RecordCreatedProperties) {
        this.props = props;
    }
}