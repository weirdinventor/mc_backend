import {v4} from "uuid";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface PasswordResetProperties {
    password: string;
}

@DecoratedEvent({
    name: 'PASSWORD_RESET',
    namespace: '@oks/iac',
    version: 1,
})
export class PasswordReset implements DomainEvent {
    id = v4()
    props: PasswordResetProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: PasswordResetProperties) {
        this.props = props;
    }
}
