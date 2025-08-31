import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Live} from "../../domain/aggregates/Live";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";


export interface GetModuleLivesInput {
    user: UserIdentity,
    moduleId: string
}

@injectable()
export class GetModuleLives implements Usecase<GetModuleLivesInput, Live[]> {

    constructor(
        @inject(Identifiers.liveRepository) private readonly _liveRepository: LiveRepository,
        @inject(Identifiers.groupRepository) private readonly _groupRepository: GroupRepository
    ) {
    }

    async execute(payload: GetModuleLivesInput): Promise<Live[]> {
        const role: UserRole = payload.user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const module = await this._groupRepository.getGroupById(payload.moduleId, {
            isModule: true
        });

        if (!module) {
            throw new GroupErrors.GroupNotFound("MODULE_NOT_FOUND");
        }

        return this._liveRepository.getLivesByGroupOrModuleId(payload.moduleId);
    }

}