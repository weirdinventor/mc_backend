import {v4} from "uuid";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {LiveStatus} from "../../../core/write/domain/types/LiveStatus";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";

export interface LiveUpdatedProperties {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    status: LiveStatus;
    airsAt: Date;
    duration: number;
    accessLevel: AccessLevel;
    ownerId: string;
    roomId: string;
    categoryId: string;
}

@DecoratedEvent({
    name: "LIVE_UPDATED",
    namespace: "moula-club",
    version: 1,
})
export class LiveUpdated implements DomainEvent {
    id = v4();
    props: LiveUpdatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: LiveUpdatedProperties) {
        this.props = props;
    }
}
