import {
    GetConversationsReadModelInput,
    GetConversationsReadModelOutput
} from "../queries/conversations/GetConversations";
import {ConversationReadModel} from "../models/ConversationReadModel";


export interface ConversationReadModelRepository {
    getConversations(payload: GetConversationsReadModelInput): Promise<GetConversationsReadModelOutput>;

    getConversationById(conversationId: string): Promise<ConversationReadModel>;
}