import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {ResourceEntity} from "../../entities/ResourceEntity";
import {Resource} from "../../../../core/write/domain/aggregates/Resource";
import {EntityManager} from "typeorm";


export class ResourceEntityMapper implements Mapper<ResourceEntity, Resource> {

    constructor(
        private readonly entityManager: EntityManager
    ) {
    }

    fromDomain(t: Resource): ResourceEntity {
        return this.entityManager.create(ResourceEntity, {
            id: t.id,
            title: t.props.title,
            description: t.props.description,
            image: t.props.image,
            url: t.props.url,
            authorId: t.props.authorId,
            groupId: t.props.groupId,
            categoryId: t.props.categoryId,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        });
    }


    toDomain(raw: ResourceEntity): Resource {
        return Resource.restore({
            id: raw.id,
            title: raw.title,
            description: raw.description,
            image: raw.image,
            url: raw.url,
            authorId: raw.authorId,
            groupId: raw.groupId,
            categoryId: raw.categoryId,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        })
    }
}