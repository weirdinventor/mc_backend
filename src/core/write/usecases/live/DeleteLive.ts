import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";

export interface DeleteLiveInput {
    user: UserIdentity;
    id: string;
}

@injectable()
export class DeleteLive implements Usecase<DeleteLiveInput, void> {
    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: DeleteLiveInput): Promise<void> {
        const {user, id} = payload

        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const live = await this._liveRepository.getLiveById(id);

        if (!live) throw new LiveErrors.LiveNotFound();

        live.deleteLive({
            id
        })
        await this._liveRepository.delete(id);
        await this.eventDispatcher.dispatch(live);
    }
}
