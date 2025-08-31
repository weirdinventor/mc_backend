import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {AccessLevel} from "../../domain/types/AccessLevel";
import {UserErrors} from "../../domain/errors/UserErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";


export interface AddUserInterestToLiveInput {
    user: UserIdentity;
    liveId: string;
}

@injectable()
export class AddUserInterestToLive implements Usecase<AddUserInterestToLiveInput, void> {

    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: AddUserInterestToLiveInput): Promise<void> {
        const {user, liveId} = payload;

        const live = await this._liveRepository.getLiveById(liveId);

        if (!live) {
            throw new LiveErrors.LiveNotFound();
        }

        if (live.props.ownerId === user.id) {
            throw new LiveErrors.UserIsOwner();
        }

        if (live.props.accessLevel === AccessLevel.PREMIUM && !user.isSubscribed) {
            throw new UserErrors.PermissionDenied();
        }

        live.userInterestAdded({
            id: liveId
        })

        await this._liveRepository.addUserInterestToLive(payload);
        await this._eventDispatcher.dispatch(live);
    }

}