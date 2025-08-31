import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";


export interface RemoveUserInterestFromLiveInput {
    user: UserIdentity;
    liveId: string;
}


@injectable()
export class RemoveUserInterestFromLive implements Usecase<RemoveUserInterestFromLiveInput, void> {

    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: RemoveUserInterestFromLiveInput): Promise<void> {
        const {liveId} = payload

        const live = await this._liveRepository.getLiveById(liveId);

        if (!live) {
            throw new LiveErrors.LiveNotFound();
        }

        await this._liveRepository.removeUserInterestFromLive(payload);
    }
}