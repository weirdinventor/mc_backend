import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface RoleAssignedProperties {
    id: string;
    userId: string;
    groupId: string;
    roleId: string;
}

@DecoratedEvent({
    name: "USER_GROUP_ROLE_ASSIGNED",
    version: 1,
    namespace: "moula-club"
})
export class RoleAssigned implements DomainEvent {

    id = v4();
    props: RoleAssignedProperties;
    timestamp? = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: RoleAssignedProperties) {
        this.props = props;
    }
}