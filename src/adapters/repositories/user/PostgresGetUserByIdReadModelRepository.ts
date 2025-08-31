import {injectable} from "inversify";
import {GetUserByIdReadModelRepository} from "../../../core/read/repositories/GetUserByIdReadModelRepository";
import {GetUserByIdReadModel} from "../../../core/read/models/GetUserByIdReadModel";
import {GetUserByIdReadModelMapper} from "../modelMappers/GetUserByIdReadModelMapper";
import {EntityManager} from "typeorm";


@injectable()
export class PostgresGetUserByIdReadModelRepository implements GetUserByIdReadModelRepository {

    private _getUserByIdReadModelMapper: GetUserByIdReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._getUserByIdReadModelMapper = new GetUserByIdReadModelMapper();
    }

    async getById(id: string): Promise<GetUserByIdReadModel> {
        const result = await this._entityManager.query(`
            SELECT users.id,
            users.status,
            users.role,
            users."isSubscribed",
            users.email,
            users."createdAt",
            users."updatedAt",
            users."deletedAt",
            profiles.username,
            profiles."firstName",
            profiles."lastName",
            profiles.gender,
            profiles."profilePicture"
            FROM users
            LEFT JOIN profiles ON users.id = profiles.id
            WHERE users.id = $1
            AND users."deletedAt" IS NULL
            `,
            [id])

        if (result.length === 0) return null;

        console.log(result)

        return this._getUserByIdReadModelMapper.toDomain(result[0]);
    }
}