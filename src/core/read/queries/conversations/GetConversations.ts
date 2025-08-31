import {ConversationReadModel} from "../../models/ConversationReadModel";
import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {ConversationReadModelRepository} from "../../repositories/ConversationReadModelRepository";
import {Identifiers} from "../../../Identifiers";

export interface GetConversationsReadModelInput {
    userId: string;
    take: number;
    skip: number;
}

export interface GetConversationsReadModelOutput {
    conversations: ConversationReadModel[];
    count: number;
}

@injectable()
export class GetConversations implements Query<GetConversationsReadModelInput, GetConversationsReadModelOutput> {
    constructor(
        @inject(Identifiers.conversationReadModelRepository)
        private readonly conversationReadModelRepository: ConversationReadModelRepository
    ) {
    }

    async execute(payload: GetConversationsReadModelInput): Promise<GetConversationsReadModelOutput> {
        return await this.conversationReadModelRepository.getConversations(payload);
    }
}