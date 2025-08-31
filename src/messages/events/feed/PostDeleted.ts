import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface PostDeletedProperties {
    id: string;
}

@DecoratedEvent({
    name: "POST_DELETED",
    version: 1,
    namespace: "moula-club",
})
export class PostDeleted implements DomainEvent {
    id = v4();
    props: PostDeletedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata

    constructor(props: PostDeletedProperties) {
        this.props = props;
    }
}