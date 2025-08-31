import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import {PostMediaType} from "../../../core/write/domain/types/PostMediaType";


export interface PostCreatedProperties {
    text: string;
    mediaUrl?: string;
    mediaType: PostMediaType;
    thumbnail?: string;
    liveCategoryId?: string;
}

@DecoratedEvent({
    name: "POST_CREATED",
    version: 1,
    namespace: "moula-club",
})
export class PostCreated implements DomainEvent {
    id = v4();
    props: PostCreatedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata

    constructor(props: PostCreatedProperties) {
        this.props = props;
    }
}
