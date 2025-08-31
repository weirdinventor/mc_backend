import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface RoleDeletedProperties {
  id: string;
}

@DecoratedEvent({
  name: "ROLE_DELETED",
  version: 1,
  namespace: "moula-club",
})
export class RoleDeleted implements DomainEvent {
  id = v4();
  props: RoleDeletedProperties;
  timestamp? = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: RoleDeletedProperties) {
    this.props = props;
  }
}
