import admin from "firebase-admin";
import {injectable} from "inversify";
import {InitiateConversationGateway} from "../../../core/write/domain/gateway/InitiateConversationGateway";
import {InitiateConversationInput} from "../../../core/write/usecases/firebase/InitiateConversation";


@injectable()
export class FirebaseInitiateConversationGateway implements InitiateConversationGateway {

    constructor(
        private readonly _firebaseConfig: admin.app.App
    ) {
    }

    async initiate(payload: InitiateConversationInput): Promise<void> {
        const {conversationId, participants} = payload;

        const database = this._firebaseConfig.database();
        const conversationsRef = database.ref("conversations");
        const initiatedConversationRef = conversationsRef.child(conversationId);
        await initiatedConversationRef.set({
            participants: participants,
            messages: []
        })
    }
}