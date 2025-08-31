import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface LiveCanceledProperties {
  id: string;
}

@DecoratedEvent({
  name: "LIVE_CANCELLED",
  namespace: "moula-club",
  version: 1,
})
export class LiveCanceled implements DomainEvent {
  id = v4();
  props: LiveCanceledProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: LiveCanceledProperties) {
    this.props = props;
  }
}
