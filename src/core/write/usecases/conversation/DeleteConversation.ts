import {inject, injectable} from "inversify";
import {Identifiers} from "../../../Identifiers";
import {ConversationGateway} from "../../domain/gateway/ConversationGateway";
import {Usecase} from "../../domain/models/Usecase";
import {ConversationRepository} from "../../domain/repositories/ConversationRepository";
import {ConversationErrors} from "../../domain/errors/ConversationErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";

export interface ConversationGatewayInput {
    id: string
}


@injectable()
export class DeleteConversation implements Usecase<ConversationGatewayInput, void> {

    constructor(
        @inject(Identifiers.conversationGateway)
        private readonly _conversationGateway: ConversationGateway,
        @inject(Identifiers.conversationRepository)
        private readonly _conversationRepository: ConversationRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: ConversationGatewayInput): Promise<void> {
        const conversation = await this._conversationRepository.getById(payload.id);

        if (!conversation) throw new ConversationErrors.ConversationNotFound();

        conversation.delete({
            id: payload.id
        })

        await this._conversationRepository.deleteConversation(payload.id);
        await this._conversationGateway.deleteConversation(payload.id);
        await this._eventDispatcher.dispatch(conversation);

    }
}