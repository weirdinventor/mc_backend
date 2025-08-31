import {v4} from "uuid";
import {UserRole} from "../../core/write/domain/types/UserRole";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {AuthMode} from "../../core/write/domain/types/AuthMode";


export interface UserSignedUpProperties {
  id: string;
  email: string;
  authMode : AuthMode
  role: UserRole
}

@DecoratedEvent({
  name: 'USER_SIGNED_UP',
  namespace: 'moula-club',
  version: 1,
})
export class UserSignedUp implements DomainEvent {
  id = v4()
  props: UserSignedUpProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: UserSignedUpProperties) {
    this.props = props;
  }
}
