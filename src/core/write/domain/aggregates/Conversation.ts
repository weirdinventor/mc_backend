import {AggregateRoot} from "../entities/AggregateRoot";
import {v4} from "uuid";
import {ConversationCreated} from "../../../../messages/events/conversation/ConversationCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {Message} from "../types/MessageType";
import {ConversationDeleted} from "../../../../messages/events/conversation/ConversationDeleted";
import {ConversationBlocked} from "../../../../messages/events/conversation/ConversationBlocked";

export interface ConversationProperties {
    id: string;
    startedBy: string;
    participant: string;
    latestMessage?: Message;
    isBlocked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


export class Conversation extends AggregateRoot<ConversationProperties> {
    static restore(props: ConversationProperties) {
        return new Conversation(props);
    }

    static create(payload: {
        startedBy: string,
        participant: string,
    }) {
        const {
            startedBy,
            participant,
        } = payload;
        const conversation = new Conversation({
            id: v4(),
            startedBy,
            participant,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        conversation.applyChange(new ConversationCreated({
            id: conversation.props.id,
            startedBy: conversation.props.startedBy,
            participant: conversation.props.participant,
        }))

        return conversation;
    }

    @Handle(ConversationCreated)
    private applyConversationCreated(event: ConversationCreated) {
        this.props.id = event.props.id;
        this.props.startedBy = event.props.startedBy;
        this.props.participant = event.props.participant;
    }

    delete(
        payload: {
            id: string
        }
    ) {
        const {id} = payload

        this.applyChange(
            new ConversationDeleted({
                id
            })
        )

        return this
    }

    @Handle(ConversationDeleted)
    private applyConversationDeleted(event: ConversationDeleted) {
        this.props.id = event.props.id;
    }

    block(
        payload: {
            id: string
        }
    ) {
        const {id} = payload

        this.applyChange(
            new ConversationBlocked({
                conversationId: id
            })
        )

        return this
    }

    @Handle(ConversationBlocked)
    private applyConversationBlocked(event: ConversationBlocked) {
        this.props.id = event.props.conversationId;
    }
}