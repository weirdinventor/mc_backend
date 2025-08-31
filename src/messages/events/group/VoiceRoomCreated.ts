import {DecoratedEvent} from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {v4} from "uuid";
import {DomainEventMetadata} from "../../utilsAndConfugrations/metadata/DomainEventMetadata";


export interface VoiceRoomCreatedProperties {
    id: string
}


@DecoratedEvent({
    name: "VOICE_ROOM_CREATED",
    namespace: "moula-club",
    version: 1,
})
export class VoiceRoomCreated implements DomainEvent {

    id = v4();
    props: VoiceRoomCreatedProperties;
    timestamp = +new Date();
    metadata: DomainEventMetadata;

    constructor(props: VoiceRoomCreatedProperties) {
        this.props = props;
    }
}