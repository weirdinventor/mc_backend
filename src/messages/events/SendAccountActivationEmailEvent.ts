
import {v4} from "uuid";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface SendAccountActivationEmailEventProperties {
  email: string,
  url : string
}

@DecoratedEvent({
  name: 'SEND_ACCOUNT_ACTIVATION_EMAIL',
  namespace: 'moula-club',
  version: 1,
})
export class SendAccountActivationEmailEvent implements DomainEvent {
  id = v4()
  props: SendAccountActivationEmailEventProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: SendAccountActivationEmailEventProperties) {
    this.props = props;
  }
}
