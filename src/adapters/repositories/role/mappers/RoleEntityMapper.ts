import {EntityManager} from "typeorm";
import {Role} from "../../../../core/write/domain/aggregates/Role";
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {RoleEntity} from "../../entities/RoleEntity";

export class RoleEntityMapper implements Mapper<RoleEntity, Role> {
    constructor(private readonly entityManager: EntityManager) {
    }

    fromDomain(param: Role): RoleEntity {
        return this.entityManager.create(RoleEntity, {
            id: param.id,
            name: param.props.name,
            permissions: param.props.permissions,
            createdAt: param.createdAt,
            groupId: param.props.groupId,
            updatedAt: param.updatedAt,
        });
    }

    toDomain(raw: RoleEntity): Role {
        return Role.restore({
            id: raw.id,
            name: raw.name,
            permissions: raw.permissions,
            groupId: raw.groupId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}
