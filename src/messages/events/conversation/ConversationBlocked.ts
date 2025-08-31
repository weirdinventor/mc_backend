import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface ConversationBlockedProperties {
    conversationId: string
}

@DecoratedEvent({
    name: "CONVERSATION_BLOCKED",
    version: 1,
    namespace: "moula-club"
})

export class ConversationBlocked implements DomainEvent {

    id = v4();
    props: ConversationBlockedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata

    constructor(
        props: ConversationBlockedProperties
    ) {
        this.props = props;
    }

}