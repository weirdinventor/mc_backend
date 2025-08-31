import {injectable} from "inversify";
import {LivesReadModelRepository} from "../../../core/read/repositories/GetLivesReadModelRepository";
import {LiveReadModelMapper} from "../modelMappers/LiveReadModelMapper";
import {EntityManager} from "typeorm";
import {LiveReadModel} from "../../../core/read/models/LiveReadModel";
import {LiveTimeframe} from "../../../core/write/domain/types/LiveTimeframe";
import {GetLivesByTimeframeInput} from "../../../core/read/queries/lives/GetLivesByTimeframe";


@injectable()
export class PostgresLiveReadModelRepository implements LivesReadModelRepository {

    private _liveReadModelMapper: LiveReadModelMapper

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._liveReadModelMapper = new LiveReadModelMapper(this._entityManager);
    }

    async getLives(): Promise<LiveReadModel[]> {
        const result = await this._entityManager.query(`
            SELECT 
                live.id as "liveId",
                live.title,
                live.description,
                live."coverImage",
                live.status,
                live.duration,
                live."accessLevel",
                live."airsAt",
                live."canceledAt",
                live."ownerId",
                live."categoryId",
                live."createdAt",
                live."updatedAt",
                users.id as "userId",
                profiles.id as "profileId",
                profiles.username,
                profiles."firstName",
                profiles."lastName",  
                profiles."profilePicture",
                json_build_object(
                    'id', live_category.id,
                    'name', live_category.name
                ) as category,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', interested_users.id,
                            'username', interested_profiles.username,
                            'firstName', interested_profiles."firstName",
                            'lastName', interested_profiles."lastName",
                            'profilePicture', interested_profiles."profilePicture"
                        )
                    ) FILTER (WHERE interested_users.id IS NOT NULL), 
                    '[]'
                ) as "interestedUsers",
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', "group".id,
                            'name', "group".name,
                            'coverImage', "group"."coverImage",
                            'thumbnail', "group".thumbnail,
                            'subject', "group".subject,
                            'permissions', "group".permissions,
                            'ownerId', "group"."ownerId",
                            'createdAt', "group"."createdAt",
                            'updatedAt', "group"."updatedAt"
                        )
                    ) FILTER (WHERE "group".id IS NOT NULL), 
                    '[]'
                ) as "group",
                json_build_object(
                    'id', record.id,
                    'title', record.title,
                    'description', record.description,
                    'thumbnail', record.thumbnail,
                    'status', record.status,
                    'fileUrl', record."fileUrl",
                    'createdAt', record."createdAt",
                    'updatedAt', record."updatedAt"
                ) as record
            FROM live
            JOIN users ON live."ownerId" = users.id
            JOIN profiles ON users.id = profiles.id
            LEFT JOIN live_category ON live."categoryId" = live_category.id
            LEFT JOIN live_interested_users ON live.id = live_interested_users."liveId"
            LEFT JOIN users interested_users ON live_interested_users."usersId" = interested_users.id
            LEFT JOIN profiles interested_profiles ON interested_users.id = interested_profiles.id
            LEFT JOIN "group" ON live."groupId" = "group".id
            LEFT JOIN record ON live."recordId" = record.id
            WHERE live.status = 'scheduled' AND live."airsAt" >= NOW()
            GROUP BY live.id, users.id, profiles.id, live_category.id, "group".id, record.id
            ORDER BY live."createdAt" DESC
        `);

        return result.map((raw: any) => this._liveReadModelMapper.toDomain(raw));
    }

    async getLivesByTimeframe(payload: GetLivesByTimeframeInput, isModule?: boolean): Promise<LiveReadModel[]> {
        const {timeframe, user, groupId} = payload;

        const moduleFilter = groupId ?
            isModule ? 'WHERE "group"."isModule" = TRUE'
                : 'WHERE "group"."isModule" = FALSE'
            : ''

        const result = await this._entityManager.query(`
            WITH members_data AS (
                SELECT "group".id as "groupId",
                       json_agg(
                           json_build_object(
                               'userId', membership."userId",
                               'groupId', membership."groupId",
                               'isAdmin', membership."isAdmin"
                           )
                       ) as "members"
                       
                FROM membership 
                JOIN "group" ON membership."groupId" = "group".id
                ${groupId ? `WHERE "group".id = '${groupId}'` : ''}    
                GROUP BY "group".id
            ),
            
            module_purchases AS (
                SELECT "group".id as "moduleId",
                       json_agg(
                          json_build_object(
                                'id', module_purchase.id,
                                'userId', module_purchase."userId",
                                'moduleId', module_purchase."moduleId"
                          )
                       ) AS "modulePurchase"
                FROM module_purchase 
                JOIN "group" ON module_purchase."moduleId" = "group".id
                WHERE module_purchase."userId" = '${user.id}' 
                ${groupId ? `AND "group".id = '${groupId}'` : ''}
                GROUP BY "group".id
            ),

            interested_users_agg AS (
                SELECT live.id as "liveId",
                       COALESCE(
                             json_agg(
                                  json_build_object(
                                       'id', interested_users.id,
                                       'username', interested_profiles.username,
                                       'firstName', interested_profiles."firstName",
                                       'lastName', interested_profiles."lastName",
                                       'profilePicture', interested_profiles."profilePicture"
                                  )
                             ) FILTER (WHERE interested_users.id IS NOT NULL),
                             '[]'
            ) AS "interestedUsers"
            
            FROM live
                LEFT JOIN live_interested_users ON live.id = live_interested_users."liveId"
                LEFT JOIN users interested_users
                ON live_interested_users."usersId" = interested_users.id
                LEFT JOIN profiles interested_profiles
                ON interested_users.id = interested_profiles.id
                GROUP BY live.id
            ),
            
             group_data AS (
                SELECT "group".id as "groupId",
                       json_build_object(
                           'id', "group".id,
                           'name', "group".name,
                           'coverImage', "group"."coverImage",
                           'thumbnail', "group".thumbnail,
                           'subject', "group".subject,
                           'permissions', "group".permissions,
                           'ownerId', "group"."ownerId",
                           'isModule', "group"."isModule",
                           'voiceRoomId', "group"."voiceRoomId",
                           'createdAt', "group"."createdAt",
                           'updatedAt', "group"."updatedAt",   
                           'members', COALESCE(md."members", '[]'),
                           'modulePurchase', COALESCE(mp."modulePurchase", '[]')
                       ) as "group"
                FROM "group"
                LEFT JOIN module_purchases mp ON "group".id = mp."moduleId"
                LEFT JOIN members_data md ON "group".id = md."groupId"
                ${moduleFilter}
            )
            
            
            SELECT live.id     as "liveId",
               live.title,
               live.description,
               live."coverImage",
               live.status,
               live.duration,
               live."accessLevel",
               live."airsAt",
               live."canceledAt",
               live."ownerId",
               live."categoryId",
               live."createdAt",
               live."updatedAt",
               users.id    as "userId",
               profiles.id as "profileId",
               profiles.username,
               profiles."firstName",
               profiles."lastName",
               profiles."profilePicture",
               json_build_object(
                       'id', live_category.id,
                       'name', live_category.name
               )           as category,
               iu."interestedUsers",
               gd."group",
               json_build_object(
                       'id', record.id,
                       'title', record.title,
                       'description', record.description,
                       'thumbnail', record.thumbnail,
                       'status', record.status,
                       'fileUrl', record."fileUrl",
                       'createdAt', record."createdAt",
                       'updatedAt', record."updatedAt"
               )           as record
            FROM live
                     JOIN users ON live."ownerId" = users.id
                     JOIN profiles ON users.id = profiles.id
                     LEFT JOIN record ON live."recordId" = record.id
                     LEFT JOIN live_category ON live."categoryId" = live_category.id
                     LEFT JOIN interested_users_agg iu ON live.id = iu."liveId"
                     LEFT JOIN group_data gd ON live."groupId" = gd."groupId"
                     
            WHERE ${timeframe === LiveTimeframe.FUTURE ? `live.status = 'scheduled' AND live."airsAt" >= NOW()` : `live.status = 'ongoing'`}
                ${groupId ? `AND gd."group" IS NOT NULL` : ''}
                AND (
                   ${user.isSubscribed ? 
                       `live."accessLevel" = 'free' OR live."accessLevel" = 'premium'` : 
                       `live."accessLevel" = 'free' AND (
                           live."groupId" IS NULL OR 
                           (gd."group"->>'isModule' = 'true' AND 
                            json_array_length(gd."group"->'modulePurchase') > 0)
                       )`
                   }
                )
                ${groupId ? `AND live."groupId" = '${groupId}'` : ''}
                AND (
                       live."groupId" IS NULL OR
                       gd."group"->>'isModule' = 'false' OR
                       (gd."group"->>'isModule' = 'true' AND 
                        (json_array_length(gd."group"->'modulePurchase') > 0))
                  )
            ORDER BY live."airsAt" ASC
        `);


        return result.map((raw: any) => this._liveReadModelMapper.toDomain(raw));
    }
}