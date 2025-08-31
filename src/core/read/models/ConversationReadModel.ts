import {Message} from "../../write/domain/types/MessageType";

interface ConversationUser {
    id: string;
    username: string;
    email: string;
    profilePicture: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConversationReadModel {
    id: string;
    /*startedBy: ConversationUser;*/
    participant: ConversationUser;
    latestMessage: Message;
    createdAt: Date;
    isBlocked: boolean;
    updatedAt: Date;
}