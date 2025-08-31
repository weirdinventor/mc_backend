import {EntityManager} from "typeorm";
import {UserEntityMapper} from "./mappers/UserEntityMapper";
import {UserRepository} from "../../../core/write/domain/repositories/UserRepository";
import {User} from "../../../core/write/domain/aggregates/User";
import {UserEntity} from "../entities/UserEntity";
import {UserIdentity} from "../../../core/write/domain/entities/UserIdentity";
import {hash} from "bcryptjs";
import {AccountStatus} from "../../../core/write/domain/types/AccountStatus";

export class PostgresUserRepository implements UserRepository {

    private readonly userEntityMapper: UserEntityMapper

    constructor(
        private readonly entityManager: EntityManager
    ) {
        this.userEntityMapper = new UserEntityMapper(this.entityManager)
    }

    async getById(id: string): Promise<User> {
        const userRepo = this.entityManager.getRepository(UserEntity)
        const userEntity = await userRepo.findOne({
            where: {
                id
            }
        })
        if (!userEntity) return null
        return this.userEntityMapper.toDomain(userEntity)
    }

    async getByEmail(email: string): Promise<User> {
        const userRepo = this.entityManager.getRepository(UserEntity)
        const userEntity = await userRepo.findOne({
            where: {
                email
            }
        })
        if (!userEntity) return null
        return this.userEntityMapper.toDomain(userEntity)
    }

    async save(user: User): Promise<void> {
        const userRepo = this.entityManager.getRepository(UserEntity)
        const userEntity = this.userEntityMapper.fromDomain(user)
        await userRepo.save(userEntity)
    }

    async isEmailExists(email: string): Promise<boolean> {
        const result = await this.entityManager.query(
            `SELECT *
             FROM users
             WHERE users.email = $1`, [email]
        )
        if (!result.length) {
            return false
        }
        return true
    }

    async changePassword(request: {
        user: UserIdentity,
        password: string
    }): Promise<void> {
        const userRepo = this.entityManager.getRepository(UserEntity)
        const {password, user} = request
        await userRepo.update(user.id, {password})
    }

    async blockUser(loggedUserId: string, userToBlockId: string): Promise<void> {
        const userRepo = this.entityManager.getRepository(UserEntity)

        await userRepo.query(
            `
                UPDATE "users"
                SET "blockedUsers" = jsonb_insert("blockedUsers", '{-1}', '"${userToBlockId}"')
                WHERE "id" = $1`,
            [loggedUserId]
        )
    }

    async isUserBlocked(loggedUserId: string, userToBlockId: string): Promise<boolean> {
        const userRepo = this.entityManager.getRepository(UserEntity)
        const user = await userRepo.findOne({
            where: {
                id: loggedUserId
            }
        })

        if (!user) return false

        return user.blockedUsers.includes(userToBlockId)
    }

    async deleteAccount(user: UserIdentity): Promise<void> {
        const {id} = user
        const userRepo = this.entityManager.getRepository(UserEntity)

        const userToDelete = await userRepo.findOne({
            where: {
                id
            }
        })

        const hashedEmail = userToDelete.email ? await hash(userToDelete.email, 10) : null;
        const hashedPhone = userToDelete.phone ? await hash(userToDelete.phone, 10) : null;

        await userRepo.update(id, {
            email: hashedEmail,
            phone: hashedPhone,
        })

        await userRepo.softDelete(id)
    }

    async activateAccount(id: string): Promise<void> {
        const userRepo = this.entityManager.getRepository(UserEntity)
        await userRepo.update(id, {
            status: AccountStatus.ACTIVE
        })
    }
}