import {EntityManager} from "typeorm";
import {Live} from "../../../../core/write/domain/aggregates/Live";
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {LiveEntity} from "../../entities/LiveEntity";

export class LiveEntityMapper implements Mapper<LiveEntity, Live> {
    constructor(private readonly entityManager: EntityManager) {
    }

    fromDomain(param: Live): LiveEntity {
        return param
            ? this.entityManager.create(LiveEntity, {
                id: param.id,
                title: param.props.title,
                description: param.props.description,
                coverImage: param.props.coverImage,
                status: param.props.status,
                ownerId: param.props.ownerId,
                categoryId: param.props.categoryId,
                groupId: param.props.groupId,
                airsAt: param.props.airsAt,
                duration: param.props.duration,
                accessLevel: param.props.accessLevel,
                canceledAt: param.props.canceledAt,
                moderators: param.props.moderators,
                notifications: param.props.notifications,
                interestedUsers: param.props.interestedUsers,
                record: param.props.record,
                createdAt: param.createdAt,
                updatedAt: param.updatedAt,
            })
            : null;
    }

    toDomain(raw: LiveEntity): Live {
        const live = Live.restore({
            id: raw.id,
            title: raw.title,
            description: raw.description,
            coverImage: raw.coverImage,
            status: raw.status,
            airsAt: raw.airsAt,
            canceledAt: raw.canceledAt,
            duration: raw.duration,
            accessLevel: raw.accessLevel,
            ownerId: raw.ownerId,
            owner: raw.owner,
            categoryId: raw.categoryId,
            category: raw.category,
            moderators: raw.moderators ?? [],
            notifications: raw.notifications ?? [],
            interestedUsers: raw.interestedUsers ?? [],
            record: raw.record && raw.record.status === "PUBLISHED" ? raw.record : null,
            group: raw.group ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });

        return live;
    }
}
