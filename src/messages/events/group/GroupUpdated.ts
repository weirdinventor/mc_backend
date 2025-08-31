import {v4} from "uuid";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {GroupPermission} from "../../../core/write/domain/types/GroupPermissions";
import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import { AccessLevel } from "../../../core/write/domain/types/AccessLevel";

export interface GroupUpdatedProperties {
    id: string;
    coverImage?: string;
    thumbnail?: string;
    name: string;
    subject: string;
    permissions: GroupPermission[];
    voiceRoomId?: string;
    accessLevel: AccessLevel;
}

@DecoratedEvent({
    name: "GROUP_UPDATED",
    version: 1,
    namespace: "moula-club",
})
export class GroupUpdated implements DomainEvent {
    id = v4();
    props: GroupUpdatedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: GroupUpdatedProperties) {
        this.props = props;
    }
}
