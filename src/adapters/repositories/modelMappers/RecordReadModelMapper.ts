import {Mapper} from "../../../core/write/domain/models/Mapper";
import {RecordReadModel} from "../../../core/read/models/RecordReadModel";
import {GroupEntityMapper} from "../group/mappers/GroupEntityMapper";
import {EntityManager} from "typeorm";


export class RecordReadModelMapper implements Mapper<any, RecordReadModel> {

    private readonly groupMapper: GroupEntityMapper

    constructor(
        private readonly _entityManager: EntityManager
    ) {
        this.groupMapper = new GroupEntityMapper(this._entityManager);
    }

    toDomain(raw: any): RecordReadModel {
        if (!raw) return null

        return {
            id: raw.record.id,
            title: raw.record.title,
            description: raw.record.description,
            thumbnail: raw.record.thumbnail,
            accessLevel: raw.accessLevel,
            status: raw.record.status,
            fileUrl: raw.record.fileUrl,
            owner: {
                id: raw.authorId,
                firstName: raw.firstName,
                lastName: raw.lastName,
                username: raw.username,
                email: raw.email,
                isSubscribed: raw.isSubscribed,
                role: raw.role,
                status: raw.status,
                profilePicture: raw.profilePicture,
                gender: raw.gender,
                createdAt: raw.userCreatedAt,
                updatedAt: raw.userUpdatedAt,
                deletedAt: raw.userDeletedAt !== null ? new Date(raw.deletedAt) : null
            },
            group: raw.group ? this.groupMapper.toDomain(raw.group).props : undefined,
            category: raw.category,
            createdAt: raw.record.createdAt,
            updatedAt: raw.record.updatedAt,
        }
    }
}