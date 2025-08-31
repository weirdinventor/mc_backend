import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import {PostMediaType} from "../../../core/write/domain/types/PostMediaType";


export interface ReactionCreatedProperties {
    emoji: string;
    userId: string;
    postId: string;
}

@DecoratedEvent({
    name: "REACTION_CREATED",
    version: 1,
    namespace: "moula-club",
})
export class ReactionCreated implements DomainEvent {
    id = v4();
    props: ReactionCreatedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata

    constructor(props: ReactionCreatedProperties) {
        this.props = props;
    }
}