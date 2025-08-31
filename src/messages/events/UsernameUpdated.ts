import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";


export interface UsernameUpdatedProperties {
    username: string;
}

@DecoratedEvent({
    name: 'USERNAME_UPDATED',
    namespace: 'moula-club',
    version: 1,
})
export class UsernameUpdated implements DomainEvent {

    id = v4();
    props: UsernameUpdatedProperties;
    timestamp = +new Date();
    metadata: any;

    constructor(props: UsernameUpdatedProperties) {
        this.props = props;
    }
}