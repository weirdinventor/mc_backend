import {Mapper} from "../../../core/write/domain/models/Mapper";
import {LiveReadModel} from "../../../core/read/models/LiveReadModel";
import {GroupEntityMapper} from "../group/mappers/GroupEntityMapper";
import {EntityManager} from "typeorm";
import {RecordEntityMapper} from "../record/mappers/RecordEntityMapper";


export class LiveReadModelMapper implements Mapper<any, LiveReadModel> {
    private readonly _groupMapper: GroupEntityMapper
    private readonly _recordMapper: RecordEntityMapper

    constructor(
        private readonly _entityManager: EntityManager
    ) {
        this._groupMapper = new GroupEntityMapper(this._entityManager)
        this._recordMapper = new RecordEntityMapper(this._entityManager)
    }

    toDomain(raw: any): LiveReadModel {
        if (!raw) return null

        return {
            id: raw.liveId,
            title: raw.title,
            description: raw.description,
            coverImage: raw.coverImage,
            status: raw.status,
            duration: raw.duration,
            accessLevel: raw.accessLevel,
            airsAt: raw.airsAt,
            canceledAt: raw.canceledAt,
            owner: {
                id: raw.ownerId,
                firstName: raw.firstName,
                lastName: raw.lastName,
                username: raw.username,
                profilePicture: raw.profilePicture
            },
            ownerId: raw.ownerId,
            categoryId: raw.categoryId,
            category: raw.category,
            group: raw.group ? this._groupMapper.toDomain(raw.group).props : undefined,
            notifications: raw.notifications,
            moderators: raw.moderators,
            interestedUsers: raw.interestedUsers ? raw.interestedUsers : [],
            record: raw.record && raw.record.status === "PUBLISHED" ? this._recordMapper.toDomain(raw.record).props : null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        }
    }
}