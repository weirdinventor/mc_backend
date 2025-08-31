import {injectable} from "inversify";
import {GetPostsReadModelRepository} from "../../../core/read/repositories/GetPostsReadModelRepository";
import {GetPostsReadModel} from "../../../core/read/models/GetPostsReadModel";
import {GetPostsInput} from "../../../core/read/queries/posts/GetPosts";
import {GetPostsReadModelMapper} from "../modelMappers/GetPostsReadModelMapper";
import {EntityManager} from "typeorm";
import {GetPostByIdInput} from "../../../core/read/queries/posts/GetPostById";


@injectable()
export class PostgresPostReadModelRepository implements GetPostsReadModelRepository {

    private _getPostsReadModelMapper: GetPostsReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._getPostsReadModelMapper = new GetPostsReadModelMapper();
    }

    async getPosts(param: GetPostsInput): Promise<{ posts: GetPostsReadModel[]; total: number }> {
        const {take, skip, liveCategoryId} = param;

        let query = `
            WITH reactions_a AS (SELECT r."postId", jsonb_agg(r.*) as items, count(*)
                                 from reactions r
                                 group by r."postId")
            SELECT 
                posts.id as "postId",
                posts.text,
                posts."mediaUrl",
                posts."mediaType",
                posts."authorId",
                posts.thumbnail,
                posts."liveCategoryId",
                posts."createdAt",
                posts."updatedAt", 
                users.id as "userId",
                users.email,
                users.phone,
                users.role,
                users.status,
                users."signInAt",
                users."createdAt",
                users."updatedAt",
                profiles.id as "profileId",
                profiles.username,
                profiles."profilePicture",
                r.items as reactions,
                r.count as "reactionsCount"
            FROM posts
            JOIN users ON posts."authorId" = users.id
            left JOIN profiles ON users.id = profiles.id
            left join reactions_a r on posts.id = r."postId"
        `;

        const queryParams = [];
        let paramIndex = 1;

        if (liveCategoryId) {
            query += ` WHERE posts."liveCategoryId" = $${paramIndex}`;
            queryParams.push(liveCategoryId);
            paramIndex++;
        }

        query += ` ORDER BY posts."createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(take, skip);

        const result = await this._entityManager.query(query, queryParams);

        // Separate query to get the total count of posts
        let totalQuery = `
            SELECT COUNT(*) AS total
            FROM posts
        `;

        const totalQueryParams = [];

        if (liveCategoryId) {
            totalQuery += ` WHERE "liveCategoryId" = $1`;
            totalQueryParams.push(liveCategoryId);
        }

        const totalResult = await this._entityManager.query(totalQuery, totalQueryParams);

        // Parse the total count result
        const total = parseInt(totalResult[0].total, 10);

        return {
            posts: result.map((r: any) => this._getPostsReadModelMapper.toDomain(r)),
            total
        };
    }

    async getPostById(param: GetPostByIdInput): Promise<GetPostsReadModel> {
        const {id} = param;

        const result = await this._entityManager.query(`
            SELECT 
                posts.id as "postId",
                posts.text,
                posts."mediaUrl",
                posts."mediaType",
                posts."authorId",
                posts."liveCategoryId",
                posts."createdAt",
                posts."updatedAt", 
                users.id as "userId",
                users.email,
                users.phone,
                users.role,
                users.status,
                users."signInAt",
                users."createdAt",
                users."updatedAt",
                profiles.id as "profileId",
                profiles.username,
                profiles."profilePicture"
            FROM posts
            JOIN users ON posts."authorId" = users.id
            JOIN profiles ON users.id = profiles.id
            WHERE posts.id = $1`, [id]
        );

        return this._getPostsReadModelMapper.toDomain(result[0]);
    }
}
