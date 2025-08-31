import {v4} from "uuid";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface UserSignInProperties {
  signInAt: Date
}

@DecoratedEvent({
  name: 'USER_SIGN_IN',
  namespace: 'moula-club',
  version: 1,
})
export class UserSignIn implements DomainEvent {
  id = v4()
  props: UserSignInProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: UserSignInProperties) {
    this.props = props;
  }
}
