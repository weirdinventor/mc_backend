import {DecoratedEvent} from "../utilsAndConfugrations/decorators/DecoratedEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface PasswordChangedProperties {
    previousPassword: string;
    newPassword: string;
    confirmPassword: string;
}


@DecoratedEvent({
    name: 'PASSWORD_CHANGED',
    namespace: 'moula-club',
    version: 1
})
export class PasswordChanged {
    id = v4()
    props: PasswordChangedProperties
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: PasswordChangedProperties) {
        this.props = props;
    }
}