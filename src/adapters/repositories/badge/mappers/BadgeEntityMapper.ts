import { Mapper } from "../../../../core/write/domain/models/Mapper";
import { Badge } from "../../../../core/write/domain/aggregates/Badge";
import { BadgeEntity } from "../../entities/BadgeEntity";
import { EntityManager } from "typeorm";

export class BadgeEntityMapper implements Mapper<BadgeEntity, Badge> {
    constructor(
        private readonly entityManager: EntityManager
    ) {}

    fromDomain(param: Badge): BadgeEntity {
        return this.entityManager.create(BadgeEntity, {
            id: param.id,
            name: param.props.name,
            description: param.props.description,
            badgeType: param.props.badgeType,
            pictureUrl: param.props.pictureUrl,
        });
    }

    toDomain(param: BadgeEntity): Badge {
        return Badge.restore({
            id: param.id,
            name: param.name,
            description: param.description,
            badgeType: param.badgeType as 'Module_Expert_Contributor' | 'Special' | 'Achievement' | 'Skill' | 'Community',
            pictureUrl: param.pictureUrl,
        });
    }
}
