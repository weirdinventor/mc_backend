import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {StreamingGateway} from "../../domain/gateway/StreamingGateway";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {LiveStatus} from "../../domain/types/LiveStatus";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";

export interface StopHlsStreamInput {
    user: UserIdentity;
    id: string;
}


@injectable()
export class StopHlsStream implements Usecase<StopHlsStreamInput, void> {

    constructor(
        @inject(Identifiers.streamingGateway)
        private readonly _streamingGateway: StreamingGateway,
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }


    async execute(payload: StopHlsStreamInput): Promise<void> {
        const {id, user} = payload

        const role = Number(user.role);
        if (role !== UserRole.ADMIN && role !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const live = await this._liveRepository.getLiveById(id);
        if (!live) {
            throw new LiveErrors.LiveNotFound()
        }

        if (live.props.status !== LiveStatus.ONGOING) {
            throw new LiveErrors.LiveNotOngoing()
        }

        live.stopHlsStream({
            id
        })

        await this._streamingGateway.stopHlsStream(payload);
        await this._eventDispatcher.dispatch(live)
    }
}