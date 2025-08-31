import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {StreamingGateway} from "../../domain/gateway/StreamingGateway";


export interface GetNumberOfParticipantsInput {
    user: UserIdentity
    sessionId: string
}

@injectable()
export class GetNumberOfParticipants implements Usecase<GetNumberOfParticipantsInput, number> {

    constructor(
        @inject(Identifiers.streamingGateway)
        private readonly _streamingGateway: StreamingGateway
    ) {
    }

    async execute(payload: GetNumberOfParticipantsInput): Promise<number> {
        return this._streamingGateway.getNumberOfParticipants(payload);
    }
}