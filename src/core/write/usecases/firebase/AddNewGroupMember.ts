import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";


export interface AddNewGroupMemberInput {
    groupId: string;
    memberId: string;
}

@injectable()
export class AddNewGroupMember implements Usecase<AddNewGroupMemberInput, void> {

    constructor(
        @inject(Identifiers.conversationGroupGateway)
        private readonly _conversationGroupGateway: ConversationGroupGateway
    ) {
    }

    async execute(payload: AddNewGroupMemberInput): Promise<void> {
        await this._conversationGroupGateway.addNewMember(payload);
    }
}