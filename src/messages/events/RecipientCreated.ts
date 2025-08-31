
import {v4} from "uuid";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface RecipientCreatedProperties {
  email: string;
  phone: string;
}

@DecoratedEvent({
  name: 'RECIPIENT_CREATED',
  namespace: 'moula-club',
  version: 1,
})
export class RecipientCreated implements DomainEvent {
  id = v4()
  props: RecipientCreatedProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: RecipientCreatedProperties) {
    this.props = props;
  }
}
