import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {Group} from "../../domain/aggregates/Group";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserErrors} from "../../domain/errors/UserErrors";
import {UserRole} from "../../domain/types/UserRole";

export interface GetModuleByIdInput {
    user: UserIdentity;
    id: string
}

@injectable()
export class GetModuleById implements Usecase<GetModuleByIdInput, Group> {

    constructor(
        @inject(Identifiers.groupRepository)
        private groupRepository: GroupRepository
    ) {
    }

    async execute(payload: GetModuleByIdInput): Promise<Group> {

        const role = payload.user.role;
        if (
            Number(role) !== UserRole.ADMIN &&
            Number(role) !== UserRole.MODERATOR &&
            !payload.user.isSubscribed) {
            throw new UserErrors.PermissionDenied("ONLY_SUBSCRIBED_USERS_CAN_ACCESS_MODULES");
        }


        let group = await this.groupRepository.getGroupById(payload.id, {
            isModule: true
        });

        if (!group) {
            throw new GroupErrors.GroupNotFound();
        }

        return group;

    }
}