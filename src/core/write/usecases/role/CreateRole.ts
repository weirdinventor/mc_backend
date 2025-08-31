import {inject, injectable} from "inversify";
import {RolePermission} from "../../domain/types/RolePermissions";
import {Usecase} from "../../domain/models/Usecase";
import {Role} from "../../domain/aggregates/Role";
import {Identifiers} from "../../../Identifiers";
import {RoleRepository} from "../../domain/repositories/RoleRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";

export interface CreateRoleInput {
    name: string;
    permissions?: RolePermission[];
    groupId: string;
}

@injectable()
export class CreateRole implements Usecase<CreateRoleInput, Role> {
    constructor(
        @inject(Identifiers.roleRepository)
        private readonly _roleRepository: RoleRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: CreateRoleInput): Promise<Role> {
        const group = await this._groupRepository.getGroupById(payload.groupId);

        if (!group) {
            throw new GroupErrors.GroupNotFound();
        }

        const role = Role.createRole(payload);
        const newRole = await this._roleRepository.createRole(role);
        await this._eventDispatcher.dispatch(role);
        return newRole;
    }
}
