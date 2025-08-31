import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";


@injectable()
export class DeleteConversationGroup implements Usecase<string, void> {

    constructor(
        @inject(Identifiers.conversationGroupGateway)
        private readonly _conversationGroupGateway: ConversationGroupGateway
    ) {
    }

    async execute(groupId: string): Promise<void> {
        await this._conversationGroupGateway.deleteGroup(groupId)
    }
}