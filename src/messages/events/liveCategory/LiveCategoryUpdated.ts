import {v4} from "uuid";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface LiveCategoryUpdatedProperties {
    id: string;
    name: string;
}

@DecoratedEvent({
    name: "LIVE_CATEGORY_UPDATED",
    namespace: "moula-club",
    version: 1,
})
export class LiveCategoryUpdated implements DomainEvent {
    id = v4();
    props: LiveCategoryUpdatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: LiveCategoryUpdatedProperties) {
        this.props = props;
    }
}
