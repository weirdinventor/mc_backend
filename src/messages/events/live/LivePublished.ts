import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface LivePublishedProperties {
  id: string;
}

@DecoratedEvent({
  name: "LIVE_PUBLISHED",
  namespace: "moula-club",
  version: 1,
})
export class LivePublished implements DomainEvent {
  id = v4();
  props: LivePublishedProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: LivePublishedProperties) {
    this.props = props;
  }
}
