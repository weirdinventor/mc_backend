import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { GroupPermission } from "../../../core/write/domain/types/GroupPermissions";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import { RolePermission } from "../../../core/write/domain/types/RolePermissions";

export interface RoleCreatedProperties {
  id: string;
  name: string;
  permissions?: RolePermission[];
  groupId: string;
}

@DecoratedEvent({
  name: "ROLE_CREATED",
  version: 1,
  namespace: "moula-club",
})
export class RoleCreated implements DomainEvent {
  id = v4();
  props: RoleCreatedProperties;
  timestamp? = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: RoleCreatedProperties) {
    this.props = props;
  }
}
