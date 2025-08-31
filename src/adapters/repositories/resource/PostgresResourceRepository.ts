import {ResourceRepository} from "../../../core/write/domain/repositories/ResourceRepository";
import {Resource} from "../../../core/write/domain/aggregates/Resource";
import {EntityManager} from "typeorm";
import {ResourceEntityMapper} from "./mappers/ResourceEntityMapper";
import {ResourceEntity} from "../entities/ResourceEntity";
import {UpdateResourceInput} from "../../../core/write/usecases/resource/UpdateResource";
import {DeleteResourceInput} from "../../../core/write/usecases/resource/DeleteResource";


export class PostgresResourceRepository implements ResourceRepository {

    private readonly _resourceEntityMapper: ResourceEntityMapper

    constructor(
        private readonly _entityManager: EntityManager
    ) {
        this._resourceEntityMapper = new ResourceEntityMapper(_entityManager);
    }


    async getById(id: string): Promise<Resource> {
        const resourceRepo = this._entityManager.getRepository(ResourceEntity)
        const resourceEntity = await resourceRepo.findOne({
            where: {
                id
            }
        })

        if (!resourceEntity)
            return null

        return this._resourceEntityMapper.toDomain(resourceEntity)
    }

    async resourceInGroup(payload: { groupId: string; resourceId: string }): Promise<boolean> {
        const {groupId, resourceId} = payload;
        const resourceRepo = this._entityManager.getRepository(ResourceEntity);

        const resource = await resourceRepo.findOne({
            where: {
                id: resourceId,
                groupId
            }
        });

        return !!resource;
    }

    async create(payload: Resource): Promise<Resource> {
        const resourceRepo = this._entityManager.getRepository(ResourceEntity)
        const resourceEntity = this._resourceEntityMapper.fromDomain(payload)

        const savedResource = await resourceRepo.save(resourceEntity)

        return this._resourceEntityMapper.toDomain(savedResource)
    }

    async update(payload: UpdateResourceInput): Promise<Resource> {
        const {resource, resourceId, user} = payload;
        const resourceRepo = this._entityManager.getRepository(ResourceEntity);

        const resourceEntity = await resourceRepo.findOne({
            where: {
                id: resourceId,
                groupId: resource.groupId,
                authorId: user.id
            }
        });

        if (!resourceEntity)
            return null;

        resourceEntity.title = resource.title;
        resourceEntity.description = resource.description;
        resourceEntity.url = resource.url;
        resourceEntity.image = resource.image;
        resourceEntity.categoryId = resource.categoryId;

        const updatedResource = await resourceRepo.save(resourceEntity)

        return this._resourceEntityMapper.toDomain(updatedResource);
    }
    

    async delete(payload: DeleteResourceInput): Promise<void> {
        const {resourceId, groupId, user} = payload;

        const resourceRepo = this._entityManager.getRepository(ResourceEntity);

        const resourceEntity = await resourceRepo.findOne({
            where: {
                id: resourceId,
                groupId,
                authorId: user.id
            }
        });

        if (!resourceEntity)
            return;

        await resourceRepo.remove(resourceEntity);
    }
}