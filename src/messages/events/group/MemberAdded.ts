import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface MemberAddedProperties {
  groupId: string;
  userId: string;
}

@DecoratedEvent({
  name: "MEMBER_ADDED",
  version: 1,
  namespace: "moula-club",
})
export class MemberAdded implements DomainEvent {
  id = v4();
  props: MemberAddedProperties;
  timestamp? = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: MemberAddedProperties) {
    this.props = props;
  }
}
