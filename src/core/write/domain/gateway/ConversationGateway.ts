import {SendMessageInput} from "../../usecases/firebase/SendMessage";
import {Message} from "../types/MessageType";

export interface ConversationGateway {
    sendMessage(payload: {
        message: Message & {
            username: string;
            profilePicture: string;
        };
        conversationId: string;
        senderId: string
    }): Promise<void>;

    deleteConversation(conversationId: string): Promise<void>;
}