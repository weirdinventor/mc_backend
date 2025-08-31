import {injectable} from "inversify";
import {ConversationReadModelRepository} from "../../../core/read/repositories/ConversationReadModelRepository";
import {GetConversationReadModelMapper} from "../modelMappers/GetConversationReadModelMapper";
import {EntityManager} from "typeorm";
import {
    GetConversationsReadModelInput,
    GetConversationsReadModelOutput
} from "../../../core/read/queries/conversations/GetConversations";
import {ConversationReadModel} from "../../../core/read/models/ConversationReadModel";


@injectable()
export class PostgresConversationReadModelRepository implements ConversationReadModelRepository {
    private _getConversationReadModelMapper: GetConversationReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._getConversationReadModelMapper = new GetConversationReadModelMapper();
    }

    async getConversations(payload: GetConversationsReadModelInput): Promise<GetConversationsReadModelOutput> {
        const {userId, take, skip} = payload

        const result = await this._entityManager.query(`
            SELECT 
                c.id AS c_id,
                c."latestMessage" AS c_latestMessage,
                c."createdAt" AS c_createdAt,
                c."updatedAt" AS c_updatedAt,
                c."isBlocked" AS c_isBlocked,
            
            CASE
            
            WHEN 
                c."startedBy" = $1 THEN
               jsonb_build_object(
                   'id', p.id, 
                   'email', p.email, 
                   'createdAt', p."createdAt", 
                   'updatedAt', p."updatedAt",
                   'username', pp.username, 
                   'profilePicture', pp."profilePicture"
                   )
            ELSE
               jsonb_build_object(
                   'id', sb.id, 
                   'email', sb.email, 
                   'createdAt', sb."createdAt", 
                   'updatedAt', sb."updatedAt", 
                   'username', sbp.username, 
                   'profilePicture', 
                   sbp."profilePicture"
               )
            END AS participant
            
            FROM conversation c
            INNER JOIN users sb ON sb.id = c."startedBy"
            INNER JOIN profiles sbp ON sbp.id = sb.id
            INNER JOIN users p ON p.id = c.participant
            INNER JOIN profiles pp ON pp.id = p.id
            WHERE c."startedBy" = $1
            OR c.participant = $1
            LIMIT $2 OFFSET $3
        `, [userId, take, skip]);

        const totalResult = await this._entityManager.query(`
            SELECT COUNT(*) AS total
            FROM conversation
        `);

        // Parse the total count result
        const total = parseInt(totalResult[0].total, 10);

        return {
            conversations: result.map(this._getConversationReadModelMapper.toDomain),
            count: total
        }
    }

    async getConversationById(conversationId: string): Promise<ConversationReadModel> {

        const result = await this._entityManager.query(`
            SELECT
                c.id AS c_id,
                c."latestMessage" AS c_latestMessage,
                c."createdAt" AS c_createdAt,
                c."updatedAt" AS c_updatedAt,
                jsonb_build_object(
                   'id', p.id, 
                   'email', p.email, 
                   'createdAt', p."createdAt", 
                   'updatedAt', p."updatedAt",
                   'username', pp.username, 
                   'profilePicture', pp."profilePicture"
                ) AS participant
            FROM
                conversation c
            INNER JOIN users sb ON sb.id = c."startedBy"
            INNER JOIN profiles sbp ON sbp.id = sb.id
            INNER JOIN users p ON p.id = c.participant
            INNER JOIN profiles pp ON pp.id = p.id
            WHERE
                c.id = $1
        `, [conversationId]);

        return this._getConversationReadModelMapper.toDomain(result[0]);

    }
}