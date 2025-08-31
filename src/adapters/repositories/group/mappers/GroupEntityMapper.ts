import {EntityManager} from "typeorm";
import {Group} from "../../../../core/write/domain/aggregates/Group";
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {GroupEntity} from "../../entities/GroupEntity";

export class GroupEntityMapper implements Mapper<GroupEntity, Group> {
    constructor(private readonly entityManager: EntityManager) {
    }

    fromDomain(param: Group): GroupEntity {
        return this.entityManager.create(GroupEntity, {
            id: param.id,
            name: param.props.name,
            coverImage: param.props.coverImage,
            thumbnail: param.props.thumbnail,
            subject: param.props.subject,
            permissions: param.props.permissions,
            ownerId: param.props.ownerId,
            members: param.props.members,
            roles: param.props.roles,
            accessLevel: param.props.accessLevel,
            isModule: param.props.isModule,
            voiceRoomId: param.props.voiceRoomId,
            createdAt: param.createdAt,
            updatedAt: param.updatedAt,
        });
    }

    toDomain(raw: any): Group {
        return Group.restore({
            id: raw.id,
            name: raw.name,
            coverImage: raw.coverImage || null,
            thumbnail: raw.thumbnail || null,
            subject: raw.subject,
            permissions: raw.permissions,
            ownerId: raw.ownerId,
            members: raw.members ? raw.members.length : 0,
            roles: raw.roles || [],
            isModule: raw.isModule,
            voiceRoomId: raw.voiceRoomId || null,
            owned: raw.isModule ? raw.modulePurchase.map((module: any) => module.userId).includes(raw.ownerId) : undefined,
            createdAt: raw.createdAt,
            accessLevel: raw.accessLevel,
            updatedAt: raw.updatedAt,
        });
    }
}