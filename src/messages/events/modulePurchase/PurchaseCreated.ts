import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface PurchaseCreatedProperties {
    id: string;
    userId: string;
    moduleId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

@DecoratedEvent({
    name: "PURCHASE_CREATED",
    version: 1,
    namespace: "moula-club"
})
export class PurchaseCreated implements DomainEvent {
    id = v4();
    props: PurchaseCreatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata

    constructor(props: PurchaseCreatedProperties) {
        this.props = props;
    }
}