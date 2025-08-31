import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface ResourceUpdatedProperties {
    title: string;
    description: string;
    url: string;
    image: string;
    authorId: string;
    groupId: string;
    categoryId: string;
}


@DecoratedEvent({
    name: "RESOURCE_UPDATED",
    version: 1,
    namespace: "moula-club",
})
export class ResourceUpdated implements DomainEvent {
    id = v4();
    props: ResourceUpdatedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: ResourceUpdatedProperties) {
        this.props = props;
    }
}