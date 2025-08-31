import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Group} from "../../domain/aggregates/Group";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserErrors} from "../../domain/errors/UserErrors";
import {UserRole} from "../../domain/types/UserRole";

export interface GetGroupsInput {
    user: UserIdentity;
    isModule?: boolean;
    paid?: boolean;
}

@injectable()
export class GetGroups implements Usecase<GetGroupsInput, Group[]> {

    constructor(
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository
    ) {
    }

    async execute(payload: GetGroupsInput): Promise<Group[]> {

        const role: UserRole = payload.user.role

        if (
            payload.isModule &&
            Number(role) !== UserRole.ADMIN &&
            Number(role) !== UserRole.MODERATOR &&
            !payload.user.isSubscribed) {
            throw new UserErrors.PermissionDenied("ONLY_SUBSCRIBED_USERS_CAN_ACCESS_MODULES");
        }

        return await this._groupRepository.getGroups({
            isModule: payload ? payload.isModule : false,
            paid: payload ? payload.paid : undefined
        });
    }
}
