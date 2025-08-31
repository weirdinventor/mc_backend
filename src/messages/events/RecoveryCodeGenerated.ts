import {v4} from "uuid";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface RecoveryCodeGeneratedProperties {
  id: string;
  email: string;
  recoveryCode: string;
}

@DecoratedEvent({
  name: 'RECOVERY_CODE_GENERATED',
  namespace: 'covoizz',
  version: 1,
})
export class RecoveryCodeGenerated implements DomainEvent {
  id = v4()
  props: RecoveryCodeGeneratedProperties;
  timestamp = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: RecoveryCodeGeneratedProperties) {
    this.props = props;
  }
}
