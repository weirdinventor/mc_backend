import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {InitiateConversationGateway} from "../../domain/gateway/InitiateConversationGateway";

export interface InitiateConversationInput {
    conversationId: string;
    participants: string[];
}


@injectable()
export class InitiateConversation implements Usecase<InitiateConversationInput, void> {

    constructor(
        @inject(Identifiers.initiateConversationGateway)
        private readonly _initiateConversationGateway: InitiateConversationGateway
    ) {
    }

    async execute(payload: InitiateConversationInput): Promise<void> {
        await this._initiateConversationGateway.initiate(payload);
    }
}