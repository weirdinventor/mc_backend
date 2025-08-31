import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface RoomCreatedProperties {
    id: string
    duration: number
}


@DecoratedEvent({
    name: "ROOM_CREATED",
    namespace: "moula-club",
    version: 1,
})
export class RoomCreated implements DomainEvent {

    id = v4();
    props: RoomCreatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: RoomCreatedProperties) {
        this.props = props;
    }
}