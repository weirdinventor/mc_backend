import admin from "firebase-admin";
import {ConversationGateway} from "../../../core/write/domain/gateway/ConversationGateway";
import {SendMessageInput} from "../../../core/write/usecases/firebase/SendMessage";
import {Message} from "../../../core/write/domain/types/MessageType";


export class FirebaseConversationGateway implements ConversationGateway {

    constructor(
        private readonly _firebaseConfig: admin.app.App
    ) {
    }

    async sendMessage(payload: {
        message: Message & {
            username: string;
            profilePicture: string;
        };
        conversationId: string;
        senderId: string
    }): Promise<void> {
        const {conversationId, message, senderId} = payload;
        const database = this._firebaseConfig.database();
        const conversationsRef = database.ref("conversations");
        const conversationRef = conversationsRef.child(conversationId);
        const messagesRef = conversationRef.child("messages");
        await messagesRef.push({
            message: {
                username: message.username,
                profilePicture: message.profilePicture || null,
                text: message.text || null,
                media: message.media || [],
                audio: message.audio || null,
                type: message.type
            },
            senderId,
            timestamp: Date.now()
        });
    }

    async deleteConversation(conversationId: string): Promise<void> {
        const database = this._firebaseConfig.database();
        const conversationGroupsRef = database.ref("conversations");
        const conversationRef = conversationGroupsRef.child(conversationId);
        await conversationRef.remove();
    }

}