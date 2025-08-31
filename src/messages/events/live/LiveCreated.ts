import {v4} from "uuid";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";
import {LiveStatus} from "../../../core/write/domain/types/LiveStatus";

export interface LiveCreatedProperties {
    title: string;
    description: string;
    coverImage: string | null;
    airsAt: Date | null;
    status: LiveStatus;
    duration: number;
    accessLevel: AccessLevel;
    roomId: string;
    ownerId: string;
    categoryId: string;
    groupId?: string;
}

@DecoratedEvent({
    name: "LIVE_CREATED",
    namespace: "moula-club",
    version: 1,
})
export class LiveCreated implements DomainEvent {
    id = v4();
    props: LiveCreatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: LiveCreatedProperties) {
        this.props = props;
    }
}
