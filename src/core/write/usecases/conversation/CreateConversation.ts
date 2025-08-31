import {Usecase} from "../../domain/models/Usecase";
import {Conversation} from "../../domain/aggregates/Conversation";
import {ConversationRepository} from "../../domain/repositories/ConversationRepository";
import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {ConversationErrors} from "../../domain/errors/ConversationErrors";
import {InitiateConversationGateway} from "../../domain/gateway/InitiateConversationGateway";
import {UserRepository} from "../../domain/repositories/UserRepository";


export interface CreateConversationInput {
    startedBy: string,
    participant: string,
}

export interface CreateConversationOutput {
    conversation: Conversation
    exist: boolean
}

@injectable()
export class CreateConversation implements Usecase<CreateConversationInput, Conversation> {
    constructor(
        @inject(Identifiers.conversationRepository)
        private readonly _conversationRepository: ConversationRepository,
        @inject(Identifiers.initiateConversationGateway)
        private readonly _initiateConversationGateway: InitiateConversationGateway,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: CreateConversationInput): Promise<Conversation> {
        const conv = Conversation.create(payload);
        const {exist, conversation} = await this._conversationRepository.createConversation(conv);
        if (exist) {
            throw new ConversationErrors.ConversationAlreadyExists()
        }

        const isParticipantBlocked = await this._userRepository.isUserBlocked(payload.startedBy, payload.participant);

        if (isParticipantBlocked) {
            throw new ConversationErrors.ConversationBlocked();
        }

        const userBlockedByParticipant = await this._userRepository.isUserBlocked(payload.participant, payload.startedBy);


        if (userBlockedByParticipant) {
            throw new ConversationErrors.ConversationBlocked();
        }
        
        await this._initiateConversationGateway.initiate({
            conversationId: conversation.props.id,
            participants: [payload.startedBy, payload.participant]
        })

        await this.eventDispatcher.dispatch(conv);

        return conversation;
    }
}