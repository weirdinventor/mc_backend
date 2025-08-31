import {v4} from "uuid";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface LiveCategoryDeletedProperties {
    id: string;
}

@DecoratedEvent({
    name: "LIVE_CATEGORY_DELETED",
    namespace: "moula-club",
    version: 1,
})
export class LiveCategoryDeleted implements DomainEvent {
    id = v4();
    props: LiveCategoryDeletedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: LiveCategoryDeletedProperties) {
        this.props = props;
    }
}
