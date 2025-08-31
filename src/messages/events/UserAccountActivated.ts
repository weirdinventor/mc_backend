import {v4} from "uuid";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {AccountStatus} from "../../core/write/domain/types/AccountStatus";


export interface UserAccountActivatedProperties {
    accountStatus: AccountStatus;
}

@DecoratedEvent({
    name: 'USER_ACCOUNT_ACTIVATED',
    namespace: 'moula-club',
    version: 1,
})
export class UserAccountActivated implements DomainEvent {
    id = v4()
    props: UserAccountActivatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: UserAccountActivatedProperties) {
        this.props = props;
    }
}
