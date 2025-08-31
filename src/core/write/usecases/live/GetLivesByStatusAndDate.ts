import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Live} from "../../domain/aggregates/Live";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";
import {LiveStatus} from "../../domain/types/LiveStatus";


export interface GetLivesByStatusAndDateInput {
    user: UserIdentity;
    filter: {
        status?: LiveStatus;
        date?: Date;
    }
}


@injectable()
export class GetLivesByStatusAndDate implements Usecase<GetLivesByStatusAndDateInput, Live[]> {

    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
    ) {
    }

    async execute(payload: GetLivesByStatusAndDateInput): Promise<Live[]> {
        const {user, filter} = payload;

        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        return this._liveRepository.getLivesByStatusAndDate(payload);
    }

}