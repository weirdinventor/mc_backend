import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface LiveDeletedProperties {
  id: string;
}

@DecoratedEvent({
  name: "LIVE_DELETED",
  namespace: "moula-club",
  version: 1,
})
export class LiveDeleted implements DomainEvent {
  id = v4();
  props: LiveDeletedProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: LiveDeletedProperties) {
    this.props = props;
  }
}
