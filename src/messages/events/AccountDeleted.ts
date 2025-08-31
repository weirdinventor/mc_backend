import {UserIdentity} from "../../core/write/domain/entities/UserIdentity";
import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface AccountDeletedProperties {
    user: UserIdentity
}


@DecoratedEvent({
    name: "ACCOUNT_DELETED",
    version: 1,
    namespace: "moula-club"
})
export class AccountDeleted implements DomainEvent {

    id = v4()
    props: AccountDeletedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: AccountDeletedProperties) {
        this.props = props;
    }
}