import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface ResourceCreatedProperties {
    title: string;
    description: string;
    url: string;
    image: string;
    groupId: string;
    categoryId: string;
}


@DecoratedEvent({
    name: "RESOURCE_CREATED",
    version: 1,
    namespace: "moula-club"
})
export class ResourceCreated implements DomainEvent {
    id = v4();
    props: ResourceCreatedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: ResourceCreatedProperties) {
        this.props = props;
    }
}