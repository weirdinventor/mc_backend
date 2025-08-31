import {InitiateConversationInput} from "../../usecases/firebase/InitiateConversation";

export interface InitiateConversationGateway {
    initiate(payload: InitiateConversationInput): Promise<void>
}