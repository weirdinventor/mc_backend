import { Mapper } from "../../../../core/write/domain/models/Mapper";
import { Grade } from "../../../../core/write/domain/aggregates/Grade";
import { GradeEntity } from "../../entities/GradeEntity";
import { EntityManager } from "typeorm";

export class GradeEntityMapper implements Mapper<GradeEntity, Grade> {

    constructor(
        private readonly entityManager: EntityManager
    ) {}
    
    fromDomain(param: Grade): GradeEntity {
        return this.entityManager.create(GradeEntity, {
            id: param.id,
            name: param.props.name,
            minXpRequired: param.props.minXpRequired,
            userTypeAccess: param.props.userTypeAccess,
            animationAssetUrl: param.props.animationAssetUrl,
        });
    }

    toDomain(param: GradeEntity): Grade {
        return Grade.restore({
            id: param.id,
            name: param.name,
            minXpRequired: param.minXpRequired,
            userTypeAccess: param.userTypeAccess,
            animationAssetUrl: param.animationAssetUrl,
            users: param.users
        });
    }
}