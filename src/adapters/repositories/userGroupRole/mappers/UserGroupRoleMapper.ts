import {EntityManager} from "typeorm";
import {UserGroupRole} from "../../../../core/write/domain/aggregates/UserGroupRole";
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {UserGroupRoleEntity} from "../../entities/UserGroupRoleEntity";

export class UserGroupRoleMapper
    implements Mapper<UserGroupRoleEntity, UserGroupRole> {
    constructor(private readonly entityManager: EntityManager) {
    }

    fromDomain(param: UserGroupRole): UserGroupRoleEntity {
        return this.entityManager.create(UserGroupRoleEntity, {
            id: param.id,
            userId: param.props.userId,
            groupId: param.props.groupId,
            roleId: param.props.roleId,
            createdAt: param.createdAt,
            updatedAt: param.updatedAt,
        });
    }

    toDomain(raw: UserGroupRoleEntity): UserGroupRole {
        const userGroupRole = UserGroupRole.restore({
            id: raw.id,
            groupId: raw.groupId,
            roleId: raw.roleId,
            userId: raw.userId,
            user: raw.user,
            role: raw.role,
        });

        return userGroupRole;
    }
}
