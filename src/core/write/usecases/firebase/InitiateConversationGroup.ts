import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";
import {Identifiers} from "../../../Identifiers";

export interface InitiateConversationGroupInput {
    conversationGroupId: string;
    creator: string;
}


@injectable()
export class InitiateConversationGroup implements Usecase<InitiateConversationGroupInput, void> {

    constructor(
        @inject(Identifiers.conversationGroupGateway)
        private readonly _conversationGroupGateway: ConversationGroupGateway
    ) {
    }

    async execute(payload: InitiateConversationGroupInput): Promise<void> {
        await this._conversationGroupGateway.initiate(payload);
    }
}