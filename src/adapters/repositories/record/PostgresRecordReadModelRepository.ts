import {injectable} from "inversify";
import {RecordReadModelRepository} from "../../../core/read/repositories/RecordReadModelRepository";
import {RecordReadModelMapper} from "../modelMappers/RecordReadModelMapper";
import {EntityManager} from "typeorm";
import {GetPublishedRecordsReadModelInput} from "../../../core/read/queries/record/GetPublishedRecords";
import {RecordReadModel} from "../../../core/read/models/RecordReadModel";
import {GetRecordByIdInput} from "../../../core/read/queries/record/GetRecordById";


@injectable()
export class PostgresRecordReadModelRepository implements RecordReadModelRepository {

    private readonly _recordReadModelMapper: RecordReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._recordReadModelMapper = new RecordReadModelMapper(_entityManager);
    }


    async getRecordById(payload: GetRecordByIdInput): Promise<RecordReadModel> {

        const {id, user, isModule} = payload;

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
                ${isModule !== undefined ? `WHERE "group"."isModule" = ${isModule}` : ""}
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
                     
            
            WHERE record.id = '${id}' 
            ${isModule !== undefined ? `AND gd."group" IS NOT NULL` : ''}
            AND record.status = 'PUBLISHED' 
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
            AND (
                live."groupId" IS NULL OR
                gd."group"->>'isModule' = 'false' OR
                (gd."group"->>'isModule' = 'true' AND 
                (json_array_length(gd."group"->'modulePurchase') > 0))
            )
        `);

        return this._recordReadModelMapper.toDomain(result[0]);
    }

    async getPublishedRecords(payload: GetPublishedRecordsReadModelInput, isModule?: boolean): Promise<RecordReadModel[]> {

        const {groupId, user} = payload;

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
                     
            WHERE record.status = 'PUBLISHED'
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
            ORDER BY record."createdAt" DESC
        `);

        console.log(result);

        return result.map((raw: any) => this._recordReadModelMapper.toDomain(raw));
    }

}