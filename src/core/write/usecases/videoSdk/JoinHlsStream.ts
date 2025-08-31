import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {StreamingGateway} from "../../domain/gateway/StreamingGateway";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {AccessLevel} from "../../domain/types/AccessLevel";
import {StreamErrors} from "../../domain/errors/StreamErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {LiveStatus} from "../../domain/types/LiveStatus";


export interface JoinHlsStreamInput {
    user: UserIdentity;
    liveId: string;
}

export interface JoinHlsStreamResponse {
    roomId: string;
    token: string;
}

@injectable()
export class JoinHlsStream implements Usecase<JoinHlsStreamInput, JoinHlsStreamResponse> {

    constructor(
        @inject(Identifiers.streamingGateway)
        private readonly _streamingGateway: StreamingGateway,
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: JoinHlsStreamInput): Promise<JoinHlsStreamResponse> {
        const live = await this._liveRepository.getLiveById(payload.liveId);
        if (!live) throw new LiveErrors.LiveNotFound();

        const liveAccessLevel: AccessLevel = live.props.accessLevel;

        if (liveAccessLevel === AccessLevel.PREMIUM && !payload.user.isSubscribed) {
            throw new StreamErrors.PremiumAccessDenied();
        }

        if (live.props.status !== LiveStatus.ONGOING)
            throw new LiveErrors.LiveNotOngoing();

        live.joinHlsStream({
            id: payload.liveId
        })

        const result = this._streamingGateway.joinHlsStream(payload);
        await this._eventDispatcher.dispatch(live)

        return result
    }
}