import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { GroupPermission } from "../../../core/write/domain/types/GroupPermissions";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import { RolePermission } from "../../../core/write/domain/types/RolePermissions";

export interface RoleUpdatedProperties {
  id: string;
  name: string;
  permissions?: RolePermission[];
  isAdmin?: boolean;
}

@DecoratedEvent({
  name: "ROLE_UPDATED",
  version: 1,
  namespace: "moula-club",
})
export class RoleUpdated implements DomainEvent {
  id = v4();
  props: RoleUpdatedProperties;
  timestamp? = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: RoleUpdatedProperties) {
    this.props = props;
  }
}
