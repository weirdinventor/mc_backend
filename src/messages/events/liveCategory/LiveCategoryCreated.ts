import {v4} from "uuid";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface LiveCategoryCreatedProperties {
    name: string;
}

@DecoratedEvent({
    name: "LIVE_CATEGORY_CREATED",
    namespace: "moula-club",
    version: 1,
})
export class LiveCategoryCreated implements DomainEvent {
    id = v4();
    props: LiveCategoryCreatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: LiveCategoryCreatedProperties) {
        this.props = props;
    }
}
