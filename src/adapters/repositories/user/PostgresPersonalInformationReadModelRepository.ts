import {EntityManager} from "typeorm";
import {injectable} from "inversify";
import {PersonalInformationReadModel} from "../../../core/read/models/PersonalInformationReadModel";
import {PersonalInformationReadModelMapper} from "../modelMappers/PersonalInformationReadModelMapper";
import {
    PersonalInformationReadModelRepository as PIReadModelRepository
} from "../../../core/read/repositories/PersonalInformationReadModelRepository";

@injectable()
export class PersonalInformationReadModelRepository implements PIReadModelRepository {

    private _personalInformationReadModelMapper: PersonalInformationReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._personalInformationReadModelMapper = new PersonalInformationReadModelMapper();
    }

    async getById(id: string): Promise<PersonalInformationReadModel> {
        const result = await this._entityManager.query(`
            WITH user_badges_cte AS (
                SELECT 
                    ub."userId",
                    jsonb_agg(
                        jsonb_build_object(
                            'id', ub.id,
                            'userId', ub."userId",
                            'badgeId', ub."badgeId",
                            'earnedTimestamp', ub."earnedTimestamp",
                            'name', b.name,
                            'description', b.description,
                            'pictureUrl', b."pictureUrl"
                        )
                    ) AS badges
                FROM user_badges ub
                JOIN badges b ON ub."badgeId" = b.id
                WHERE ub."userId" = $1
                GROUP BY ub."userId"
            )
            SELECT users.id,
                   users.status,
                   users.role,
                   users."isSubscribed",
                   users.email,
                   users."createdAt",
                   users."updatedAt",
                   users."deletedAt",
                   users."experiencePoints",
                   users."currentGradeId",
                   profiles.username,
                   profiles."firstName",
                   profiles."lastName",
                   profiles.gender,
                   profiles."profilePicture",
                   grades.id as "gradeId",
                   grades.name as "gradeName",
                   grades."animationAssetUrl",
                   COALESCE(ubc.badges, '[]'::jsonb) as badges
            FROM users
                     LEFT JOIN profiles ON users.id = profiles.id
                     LEFT JOIN grades ON users."currentGradeId" = grades.id
                     LEFT JOIN user_badges_cte ubc ON users.id = ubc."userId"
            WHERE users.id = $1
              AND users."deletedAt" IS NULL
        `, [id]);

        const userData = result[0];
        if (userData && userData.badges && typeof userData.badges === 'string') {
            try {
                userData.badges = JSON.parse(userData.badges);
            } catch (e) {
                userData.badges = [];
            }
        }

        return this._personalInformationReadModelMapper.toDomain(userData);
    }

    async getAllUsers(payload: {
        subscribed?: boolean,
        take?: number,
        skip?: number
    }): Promise<{
        users: PersonalInformationReadModel[];
        total: number;
    }> {

        const {subscribed, skip, take} = payload;

        const usersFilter = subscribed !== undefined ?
            `WHERE users."isSubscribed" = ${subscribed}
             AND users."deletedAt" IS NULL
            ` :
            `WHERE users."deletedAt" IS NULL`;

        const result = await this._entityManager.query(`
            WITH user_badges_cte AS (
                SELECT 
                    ub."userId",
                    jsonb_agg(
                        jsonb_build_object(
                            'id', ub.id,
                            'userId', ub."userId",
                            'badgeId', ub."badgeId",
                            'earnedTimestamp', ub."earnedTimestamp",
                            'name', b.name,
                            'description', b.description
                        )
                    ) AS badges
                FROM user_badges ub
                JOIN badges b ON ub."badgeId" = b.id
                GROUP BY ub."userId"
            )
            SELECT 
                   users.id,
                   users.status,
                   users.role,
                   users."isSubscribed",
                   users.email,
                   users."createdAt",
                   users."updatedAt",
                   users."experiencePoints",
                   users."currentGradeId",
                   profiles.username,
                   profiles."firstName",
                   profiles."lastName",
                   profiles.gender,
                   profiles."profilePicture",
                   grades.id as "gradeId",
                   grades.name as "gradeName",
                   grades."animationAssetUrl",
                   COALESCE(ubc.badges, '[]'::jsonb) as badges
            FROM users
                     LEFT JOIN profiles ON users.id = profiles.id
                     LEFT JOIN grades ON users."currentGradeId" = grades.id
                     LEFT JOIN user_badges_cte ubc ON users.id = ubc."userId"
                ${usersFilter}
            ORDER BY users."createdAt" DESC
                LIMIT ${take}
            OFFSET ${skip}
        `);

        // Ensure badges are properly parsed if they're returned as strings
        result.forEach((user: any) => {
            if (user.badges && typeof user.badges === 'string') {
                try {
                    user.badges = JSON.parse(user.badges);
                } catch (e) {
                    user.badges = [];
                }
            }
        });

        const total = await this._entityManager.createQueryBuilder("users", "users_alias")
            .getCount();

        return {
            users: result.map((user: any) => this._personalInformationReadModelMapper.toDomain(user)),
            total
        };
    }
}
