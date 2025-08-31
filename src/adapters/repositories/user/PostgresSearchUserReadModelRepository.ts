import {injectable} from "inversify";
import {SearchUserReadModelMapper} from "../modelMappers/SearchUserReadModelMapper";
import {EntityManager} from "typeorm";
import {SearchUserReadModelRepository} from "../../../core/read/repositories/SearchUserReadModelRepository";
import {SearchUserReadModel} from "../../../core/read/models/SearchUserReadModel";
import {UserIdentity} from "../../../core/write/domain/entities/UserIdentity";


@injectable()
export class PostgresSearchUserReadModelRepository implements SearchUserReadModelRepository {
    private _searchUserReadModelMapper: SearchUserReadModelMapper;

    constructor(
        private readonly _entityManager: EntityManager,
    ) {
        this._searchUserReadModelMapper = new SearchUserReadModelMapper();
    }

    async searchUserByUsername(user: UserIdentity, username: string): Promise<SearchUserReadModel[]> {
        const result = await this._entityManager.query(`
            SELECT users.id,
                   profiles.username,
                   profiles."profilePicture",
                   profiles."createdAt"

            FROM users
                     LEFT JOIN profiles ON users.id = profiles.id
            WHERE LOWER(profiles.username) LIKE LOWER('%' || $1 || '%')
              AND users.id NOT IN (SELECT jsonb_array_elements_text("blockedUsers")
                                   FROM users
                                   WHERE id = $2)
              AND users.id != $2
        `, [username.toLowerCase(), user.id]);

        return result.map((user: any) => this._searchUserReadModelMapper.toDomain(user));
    }

}