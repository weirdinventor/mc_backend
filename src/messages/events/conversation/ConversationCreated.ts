import {v4} from "uuid";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface ConversationCreatedProperties {
    id: string;
    startedBy: string;
    participant: string;
}

@DecoratedEvent({
    name: "CONVERSATION_CREATED",
    version: 1,
    namespace: "moula-club",
})
export class ConversationCreated implements DomainEvent {

    id = v4();
    props: ConversationCreatedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata

    constructor(
        props: ConversationCreatedProperties
    ) {
        this.props = props;
    }
}
