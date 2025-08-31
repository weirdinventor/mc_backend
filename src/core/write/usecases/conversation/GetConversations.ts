import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Conversation} from "../../domain/aggregates/Conversation";
import {Identifiers} from "../../../Identifiers";
import {ConversationRepository} from "../../domain/repositories/ConversationRepository";


export interface GetConversationsInput {
    userId: string;
    take: number;
    skip: number;
}

export interface GetConversationsOutput {
    conversations: Conversation[];
    count: number;
}


@injectable()
export class GetConversations implements Usecase<GetConversationsInput, GetConversationsOutput> {

    constructor(
        @inject(Identifiers.conversationRepository)
        private readonly _conversationRepository: ConversationRepository
    ) {
    }

    async execute(payload: GetConversationsInput): Promise<GetConversationsOutput> {
        return await this._conversationRepository.getConversations(payload);
    }
}