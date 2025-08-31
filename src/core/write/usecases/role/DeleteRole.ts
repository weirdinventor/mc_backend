import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {RoleRepository} from "../../domain/repositories/RoleRepository";
import {RoleErrors} from "../../domain/errors/RoleErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";

export interface DeleteRoleInput {
    roleId: string;
}

@injectable()
export class DeleteRole implements Usecase<DeleteRoleInput, void> {
    constructor(
        @inject(Identifiers.roleRepository)
        private readonly _roleRepository: RoleRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: DeleteRoleInput): Promise<void> {
        const {roleId} = payload;


        const role = await this._roleRepository.getById(roleId);

        if (!role) {
            throw new RoleErrors.RoleNotFound();
        }

        role.deleteRole(role.props.id);

        await this._roleRepository.deleteRole(roleId);
        await this._eventDispatcher.dispatch(role);
    }
}
