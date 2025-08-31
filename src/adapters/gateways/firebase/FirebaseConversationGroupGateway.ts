import {injectable} from "inversify";
import {ConversationGroupGateway} from "../../../core/write/domain/gateway/ConversationGroupGateway";
import admin from "firebase-admin";
import {InitiateConversationGroupInput} from "../../../core/write/usecases/firebase/InitiateConversationGroup";
import {AddNewGroupMemberInput} from "../../../core/write/usecases/firebase/AddNewGroupMember";
import {SendGroupMessageInput} from "../../../core/write/usecases/firebase/SendGroupMessage";
import {Message} from "../../../core/write/domain/types/MessageType";


@injectable()
export class FirebaseConversationGroupGateway implements ConversationGroupGateway {

    constructor(
        private readonly _firebaseConfig: admin.app.App
    ) {
    }


    async initiate(payload: InitiateConversationGroupInput): Promise<void> {
        const {conversationGroupId, creator} = payload;

        const database = this._firebaseConfig.database();
        const conversationGroupsRef = database.ref("conversationGroups");
        const initiatedConversationGroupRef = conversationGroupsRef.child(conversationGroupId);

        const newParticipantRef = initiatedConversationGroupRef.child('participants').push();
        const creatorKey = newParticipantRef.key;

        await initiatedConversationGroupRef.set({
            participants: {[creatorKey]: creator},
            messages: []
        });
    }

    async sendMessage(payload: {
        message: Message & {
            username: string;
            profilePicture: string;
            createdAt: Date;
        };
        conversationId: string;
        senderId: string
    }): Promise<void> {
        const {conversationId, message, senderId} = payload;
        const database = this._firebaseConfig.database();
        const conversationGroupsRef = database.ref("conversationGroups");
        const conversationGroupRef = conversationGroupsRef.child(conversationId);
        const messagesRef = conversationGroupRef.child("messages");
        await messagesRef.push({
            message: {
                username: message.username,
                profilePicture: message.profilePicture || null,
                userCreatedAt: message.createdAt.getTime(),
                text: message.text || null,
                media: message.media || [],
                audio: message.audio || null,
                type: message.type
            },
            senderId,
            timestamp: Date.now()
        });
    }

    async deleteGroup(groupId: string): Promise<void> {
        const database = this._firebaseConfig.database()
        const conversationGroupsRef = database.ref("conversationGroups")
        const conversationGroupRef = conversationGroupsRef.child(groupId)
        await conversationGroupRef.remove()
    }


    async addNewMember(payload: AddNewGroupMemberInput): Promise<void> {
        const {memberId, groupId} = payload
        const database = this._firebaseConfig.database();
        const conversationGroupsRef = database.ref("conversationGroups");
        const conversationGroupRef = conversationGroupsRef.child(groupId);
        const participantsRef = conversationGroupRef.child("participants");
        await participantsRef.push(memberId);
    }
}