import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {UserGroupRole} from "../../domain/aggregates/UserGroupRole";
import {Identifiers} from "../../../Identifiers";
import {UserGroupRoleRepository} from "../../domain/repositories/UserGroupRoleRepository";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {UserErrors} from "../../domain/errors/UserErrors";
import {RoleRepository} from "../../domain/repositories/RoleRepository";
import {RoleErrors} from "../../domain/errors/RoleErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {UserGroupRoleErrors} from "../../domain/errors/UserGroupRoleErrors";

export interface AssignRoleToUserInput {
    userId: string;
    groupId: string;
    roleId: string;
}

@injectable()
export class AssignRoleToUser
    implements Usecase<AssignRoleToUserInput, UserGroupRole> {
    constructor(
        @inject(Identifiers.userGroupRoleRepository)
        private readonly _userGroupRoleRepository: UserGroupRoleRepository,
        @inject(Identifiers.groupRepository)
        private readonly groupRepository: GroupRepository,
        @inject(Identifiers.userRepository)
        private readonly userRepository: UserRepository,
        @inject(Identifiers.roleRepository)
        private readonly roleRepository: RoleRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: AssignRoleToUserInput): Promise<UserGroupRole> {
        const group = await this.groupRepository.getGroupById(payload.groupId);
        if (!group) throw new GroupErrors.GroupNotFound();

        const user = await this.userRepository.getById(payload.userId);
        if (!user) throw new UserErrors.UserNotFound();

        const role = await this.roleRepository.getById(payload.roleId);
        if (!role) throw new RoleErrors.RoleNotFound();

        const isMember = await this.groupRepository.isUserMemberOfGroup({
            groupId: payload.groupId,
            userId: payload.userId
        })

        if (!isMember) {
            throw new GroupErrors.GroupMemberNotFound();
        }

        const isRoleAssigned = await this._userGroupRoleRepository.isRoleAssigned(payload);

        if (isRoleAssigned) {
            throw new UserGroupRoleErrors.RoleAlreadyAssigned();
        }

        const userGroupRole = UserGroupRole.assignRoleToUser(payload);

        const newUserGroupRole =
            await this._userGroupRoleRepository.assignRoleToUser(userGroupRole);

        await this.eventDispatcher.dispatch(userGroupRole)

        return newUserGroupRole;
    }
}
