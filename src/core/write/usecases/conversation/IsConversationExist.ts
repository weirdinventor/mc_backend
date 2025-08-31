import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {ConversationReadModel} from "../../../read/models/ConversationReadModel";
import {ConversationReadModelRepository} from "../../../read/repositories/ConversationReadModelRepository";
import {Identifiers} from "../../../Identifiers";
import {ConversationRepository} from "../../domain/repositories/ConversationRepository";


export interface IsConversationExistInput {
    senderId: string,
    receiverId: string
}

@injectable()
export class IsConversationExist implements Usecase<IsConversationExistInput, ConversationReadModel> {

    constructor(
        @inject(Identifiers.conversationReadModelRepository)
        private readonly _conversationReadModelRepository: ConversationReadModelRepository,
        @inject(Identifiers.conversationRepository)
        private readonly _conversationRepository: ConversationRepository
    ) {
    }

    async execute(payload: IsConversationExistInput): Promise<ConversationReadModel> {
        const conversation = await this._conversationRepository.isConversationExist(payload);

        if (conversation) {
            return this._conversationReadModelRepository.getConversationById(conversation.id);
        }

        return null;
    }

}