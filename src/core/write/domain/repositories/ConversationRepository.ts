import {Conversation} from "../aggregates/Conversation";
import {GetConversationsInput, GetConversationsOutput} from "../../usecases/conversation/GetConversations";
import {CreateConversationOutput} from "../../usecases/conversation/CreateConversation";
import {Message} from "../types/MessageType";
import {IsConversationExistInput} from "../../usecases/conversation/IsConversationExist";

export interface ConversationRepository {
    getById(id: string): Promise<Conversation>;

    getConversationByOwner(ownerId: string, userToBlockId: string): Promise<Conversation>;

    getConversations(payload: GetConversationsInput): Promise<GetConversationsOutput>;

    createConversation(conversation: Conversation): Promise<CreateConversationOutput>;

    saveLastMessage(id: string, conversation: Message): Promise<void>;

    isConversationExist(payload: IsConversationExistInput): Promise<Conversation>;

    deleteConversation(conversationId: string): Promise<void>

    setAsBlocked(conversationId: string): Promise<void>

    isAlreadyBlocked(conversationId: string): Promise<boolean>
}