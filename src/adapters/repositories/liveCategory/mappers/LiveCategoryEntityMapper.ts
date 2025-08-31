import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {LiveCategoryEntity} from "../../entities/LiveCategoryEntity";
import {LiveCategory} from "../../../../core/write/domain/aggregates/LiveCategory";
import {EntityManager} from "typeorm";


export class LiveCategoryEntityMapper implements Mapper<LiveCategoryEntity, LiveCategory> {

    constructor(
        private readonly entityManager: EntityManager
    ) {
    }

    fromDomain(param: LiveCategory): LiveCategoryEntity {
        return param ?
            this.entityManager.create(LiveCategoryEntity, {
                id: param.id,
                name: param.props.name,
                createdAt: param.createdAt,
                updatedAt: param.updatedAt
            })
            : null

    }

    toDomain(raw: LiveCategoryEntity): LiveCategory {
        return LiveCategory.restore({
            id: raw.id,
            name: raw.name,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        })
    }
}