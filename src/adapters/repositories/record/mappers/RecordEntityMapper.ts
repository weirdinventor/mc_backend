import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {RecordEntity} from "../../entities/RecordEntity";
import {Record} from "../../../../core/write/domain/aggregates/Record";
import {EntityManager} from "typeorm";
import {LiveCategoryEntity} from "../../entities/LiveCategoryEntity";


export class RecordEntityMapper implements Mapper<RecordEntity, Record> {
    constructor(
        private readonly entityManager: EntityManager
    ) {
    }

    fromDomain(t: Record): RecordEntity {
        return t ? this.entityManager.create(RecordEntity, {
            id: t.id,
            title: t.props.title,
            description: t.props.description,
            thumbnail: t.props.thumbnail,
            status: t.props.status,
            fileUrl: t.props.fileUrl,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        }) : null;
    }

    toDomain(raw: RecordEntity, other?: {
        category: LiveCategoryEntity
    }): Record {
        return Record.restore({
            id: raw.id,
            title: raw.title,
            description: raw.description,
            thumbnail: raw.thumbnail,
            status: raw.status,
            fileUrl: raw.fileUrl,
            category: other ? other.category : undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }
}