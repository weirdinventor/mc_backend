import {injectable} from "inversify";
import {ResourceReadModelRepository} from "../../../core/read/repositories/ResourceReadModelRepository";
import {ResourceReadModelMapper} from "../modelMappers/ResourceReadModelMapper";
import {EntityManager} from "typeorm";
import {ResourceReadModel} from "../../../core/read/models/ResourceReadModel";


@injectable()
export class PostgresResourceReadModelRepository implements ResourceReadModelRepository {
    private readonly _resourceReadModelMapper: ResourceReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._resourceReadModelMapper = new ResourceReadModelMapper();
    }

    async getResources(payload: { groupId: string }): Promise<ResourceReadModel[]> {
        const result = await this._entityManager.query(`
            SELECT
                resource.id,
                resource.title,
                resource.description,
                resource.url,
                resource.image,
                resource."groupId",
                resource."createdAt",
                resource."updatedAt",
                users.id as "authorId",
                users.email,
                users.role,
                users.status,
                users."createdAt" as "userCreatedAt",
                users."updatedAt" as "userUpdatedAt",
                users."deletedAt" as "userDeletedAt",
                users."isSubscribed",
                profiles.id as "profileId",
                profiles.username,
                profiles."profilePicture",
                profiles.gender,
                profiles."firstName",
                profiles."lastName",
                json_build_object(
                    'id', live_category.id,
                    'name', live_category.name,
                    'createdAt', live_category."createdAt",
                    'updatedAt', live_category."updatedAt"
                ) as category
            FROM resource
            JOIN users ON resource."authorId" = users.id
            JOIN profiles ON users.id = profiles.id
            LEFT JOIN live_category ON resource."categoryId" = live_category.id
            WHERE resource."groupId" = $1
            AND users."deletedAt" IS NULL
            GROUP BY resource.id, users.id, profiles.id, live_category.id
            ORDER BY resource."createdAt" DESC
        `, [payload.groupId]);

        return result.map((resource: any) => this._resourceReadModelMapper.toDomain(resource));
    }

    async getResourceById(payload: {
        resourceId: string;
        groupId: string;
    }): Promise<ResourceReadModel> {
        const {groupId, resourceId} = payload;
        const result = await this._entityManager.query(`
            SELECT
                resource.id,
                resource.title,
                resource.description,
                resource.url,
                resource.image,
                resource."groupId",
                resource."createdAt",
                resource."updatedAt",
                users.id as "authorId",
                users.email,
                users.role,
                users.status,
                users."createdAt" as "userCreatedAt",
                users."updatedAt" as "userUpdatedAt",
                users."isSubscribed",
                profiles.id as "profileId",
                profiles.username,
                profiles."profilePicture",
                profiles.gender,
                profiles."firstName",
                profiles."lastName",
                json_build_object(
                    'id', live_category.id,
                    'name', live_category.name,
                    'createdAt', live_category."createdAt",
                    'updatedAt', live_category."updatedAt"
                ) as category
            FROM resource
            JOIN users ON resource."authorId" = users.id
            JOIN profiles ON users.id = profiles.id
            LEFT JOIN live_category ON resource."categoryId" = live_category.id
            WHERE resource.id = $1
            AND users."deletedAt" IS NULL
            AND resource."groupId" = $2
            
        `, [resourceId, groupId]);

        return this._resourceReadModelMapper.toDomain(result[0]);
    }
}