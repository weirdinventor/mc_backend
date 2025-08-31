import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {StreamingGateway} from "../../domain/gateway/StreamingGateway";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";


export interface StartHlsStreamInput {
    user: UserIdentity,
    liveId: string;
}

export interface StartHlsStreamResponse {
    roomId: string;
    token: string;
}

@injectable()
export class StartHlsStream implements Usecase<StartHlsStreamInput, StartHlsStreamResponse> {

    constructor(
        @inject(Identifiers.streamingGateway)
        private readonly _streamingGateway: StreamingGateway,
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(request: StartHlsStreamInput): Promise<StartHlsStreamResponse> {
        const live = await this._liveRepository.getLiveById(request.liveId);
        if (!live) throw new LiveErrors.LiveNotFound();
        const role = Number(request.user.role);
        if (role !== UserRole.ADMIN && role !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        live.startHlsStream({
            id: request.liveId,
        })

        const result = this._streamingGateway.startHlsStream(request);
        await this._eventDispatcher.dispatch(live)

        return result
    }

}