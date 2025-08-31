import {InitiateConversationGroupInput} from "../../usecases/firebase/InitiateConversationGroup";
import {AddNewGroupMemberInput} from "../../usecases/firebase/AddNewGroupMember";
import {Message} from "../types/MessageType";


export interface ConversationGroupGateway {
    initiate(payload: InitiateConversationGroupInput): Promise<void>;

    sendMessage(payload: {
        message: Message & {
            username: string;
            profilePicture: string;
            createdAt: Date;
        };
        conversationId: string;
        senderId: string
    }): Promise<void>;

    deleteGroup(groupId: string): Promise<void>;

    addNewMember(payload: AddNewGroupMemberInput): Promise<void>;
}