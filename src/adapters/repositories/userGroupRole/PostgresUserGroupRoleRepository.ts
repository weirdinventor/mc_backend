import {EntityManager} from "typeorm";
import {UserGroupRoleRepository} from "../../../core/write/domain/repositories/UserGroupRoleRepository";
import {UserGroupRoleMapper} from "./mappers/UserGroupRoleMapper";
import {UserGroupRole} from "../../../core/write/domain/aggregates/UserGroupRole";
import {UserGroupRoleEntity} from "../entities/UserGroupRoleEntity";

export class PostgresUserGroupRoleRepository
    implements UserGroupRoleRepository {
    private readonly userGroupRoleMapper: UserGroupRoleMapper;

    constructor(private readonly entityManager: EntityManager) {
        this.userGroupRoleMapper = new UserGroupRoleMapper(this.entityManager);
    }

    async assignRoleToUser(ugr: UserGroupRole): Promise<UserGroupRole> {
        const userGroupRoleRepo =
            this.entityManager.getRepository(UserGroupRoleEntity);
        const userGroupRoleEntity = this.userGroupRoleMapper.fromDomain(ugr);

        const savedUserGroupRole = await userGroupRoleRepo.save(
            userGroupRoleEntity
        );

        const userGroupRole = await userGroupRoleRepo.findOne({
            where: {id: savedUserGroupRole.id},
            relations: ["user", "role"],
        });

        return this.userGroupRoleMapper.toDomain(userGroupRole);
    }

    async isRoleAssigned(payload: { userId: string; groupId: string; roleId: string }): Promise<boolean> {

        const userGroupRoleRepo = this.entityManager.getRepository(UserGroupRoleEntity);
        const userGroupRole = await userGroupRoleRepo.findOne({
            where: {
                userId: payload.userId,
                groupId: payload.groupId,
                roleId: payload.roleId,
            },
        });

        return !!userGroupRole;
    }
}
