import { Mapper } from "../../../../core/write/domain/models/Mapper";
import { UserBadge } from "../../../../core/write/domain/aggregates/UserBadge";
import { UserBadgesEntity } from "../../entities/UserBadgesEntity";
import { EntityManager } from "typeorm";
import { v4 as uuidv4 } from "uuid";

export class UserBadgesEntityMapper implements Mapper<UserBadgesEntity, UserBadge> {
    constructor(
        private readonly entityManager: EntityManager
    ) {}
    
    fromDomain(param: UserBadge): UserBadgesEntity {
        return this.entityManager.create(UserBadgesEntity, {
            id: param.id,
            userId: param.props.userId,
            badgeId: param.props.badgeId,
            earnedTimestamp: param.props.earnedTimestamp,
        });
    }

    toDomain(param: UserBadgesEntity): UserBadge {
        return UserBadge.restore({
            id: param.id,
            userId: param.userId,
            badgeId: param.badgeId,
            earnedTimestamp: param.earnedTimestamp,
        });
    }
}