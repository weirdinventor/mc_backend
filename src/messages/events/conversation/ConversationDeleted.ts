import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface ConversationDeletedProperties {
    id: string;
}


@DecoratedEvent({
    name: "CONVERSATION_DELETED",
    version: 1,
    namespace: "moula-club",
})
export class ConversationDeleted implements DomainEvent {

    id = v4();
    props: ConversationDeletedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata

    constructor(
        props: ConversationDeletedProperties
    ) {
        this.props = props;
    }
}