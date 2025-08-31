import {inject, injectable} from "inversify";
import {Role} from "../../domain/aggregates/Role";
import {Usecase} from "../../domain/models/Usecase";
import {RolePermission} from "../../domain/types/RolePermissions";
import {Identifiers} from "../../../Identifiers";
import {RoleRepository} from "../../domain/repositories/RoleRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {RoleErrors} from "../../domain/errors/RoleErrors";

export interface UpdateRoleInput {
    id: string;
    name: string;
    permissions?: RolePermission[];
}

@injectable()
export class UpdateRole implements Usecase<UpdateRoleInput, Role> {
    constructor(
        @inject(Identifiers.roleRepository)
        private readonly _roleRepository: RoleRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: UpdateRoleInput): Promise<Role> {
        const role = await this._roleRepository.getById(payload.id);

        if (!role)
            throw new RoleErrors.RoleNotFound();

        role.updateRole(payload)

        const updatedRole = await this._roleRepository.updateRole({
            id: role.props.id,
            name: payload.name,
            permissions: payload.permissions
        });

        await this._eventDispatcher.dispatch(role);

        return updatedRole;
    }
}
