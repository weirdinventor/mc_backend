import {EntityManager} from "typeorm";
import {RoleRepository} from "../../../core/write/domain/repositories/RoleRepository";
import {GroupEntityMapper} from "../group/mappers/GroupEntityMapper";
import {RoleEntityMapper} from "./mappers/RoleEntityMapper";
import {Role} from "../../../core/write/domain/aggregates/Role";
import {RoleEntity} from "../entities/RoleEntity";
import {UpdateRoleInput} from "../../../core/write/usecases/role/UpdateRole";

export class PostgresRoleRepository implements RoleRepository {
    private readonly roleEntityMapper: RoleEntityMapper;

    constructor(private readonly entityManager: EntityManager) {
        this.roleEntityMapper = new RoleEntityMapper(this.entityManager);
    }

    async getById(id: string): Promise<Role> {
        const roleRepo = this.entityManager.getRepository(RoleEntity);
        const role = await roleRepo.findOne({
            where: {
                id,
            },
        });

        if (!role) return null;

        return this.roleEntityMapper.toDomain(role);
    }

    async createRole(role: Role): Promise<Role> {
        const roleRepo = this.entityManager.getRepository(RoleEntity);
        const roleEntity = this.roleEntityMapper.fromDomain(role);

        const savedRole = await roleRepo.save(roleEntity);

        return this.roleEntityMapper.toDomain(savedRole);
    }

    async updateRole(role: UpdateRoleInput): Promise<Role> {
        const {id} = role;
        const roleRepo = this.entityManager.getRepository(RoleEntity);

        await roleRepo.update(id, role);

        const updatedRole = await roleRepo.findOne({
            where: {
                id,
            },
        });

        if (!updatedRole) {
            throw new Error("Role not found");
        }

        return this.roleEntityMapper.toDomain(updatedRole);
    }

    async deleteRole(roleId: string): Promise<void> {
        const roleRepo = this.entityManager.getRepository(RoleEntity);
        const role = await roleRepo.findOne({
            where: {
                id: roleId,
            },
        });

        if (!role) {
            throw new Error("Role not found");
        }

        await roleRepo.remove(role);
    }
}
