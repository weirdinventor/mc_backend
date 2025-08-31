import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface ResourceDeletedProperties {
    id: string;
}


@DecoratedEvent({
    name: "RESOURCE_DELETED",
    version: 1,
    namespace: "moula-club",
})
export class ResourceDeleted implements DomainEvent {
    id = v4();
    props: ResourceDeletedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: ResourceDeletedProperties) {
        this.props = props;
    }
}