import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface GroupDeletedProperties {
  id: string;
}

@DecoratedEvent({
  name: "GROUP_DELETED",
  version: 1,
  namespace: "moula-club",
})
export class GroupDeleted implements DomainEvent {
  id = v4();
  props: GroupDeletedProperties;
  timestamp? = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: GroupDeletedProperties) {
    this.props = props;
  }
}
