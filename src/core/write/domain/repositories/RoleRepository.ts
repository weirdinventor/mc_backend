import {UpdateRoleInput} from "../../usecases/role/UpdateRole";
import {Role} from "../aggregates/Role";

export interface RoleRepository {
    getById(id: string): Promise<Role>;

    createRole(role: Role): Promise<Role>;

    updateRole(role: UpdateRoleInput): Promise<Role>;

    deleteRole(roleId: string): Promise<void>;
}
