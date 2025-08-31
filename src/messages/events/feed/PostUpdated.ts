import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import {PostMediaType} from "../../../core/write/domain/types/PostMediaType";


export interface PostUpdatedProperties {
    id: string;
    text: string;
    mediaUrl?: string;
    mediaType: PostMediaType;
    thumbnail?: string;
    liveCategoryId?: string;
}

@DecoratedEvent({
    name: "POST_UPDATED",
    version: 1,
    namespace: "moula-club",
})
export class PostUpdated implements DomainEvent {
    id = v4();
    props: PostUpdatedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata

    constructor(props: PostUpdatedProperties) {
        this.props = props;
    }
}
