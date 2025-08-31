import { EntityManager, FindOneOptions } from "typeorm";
import { UserBadgesEntity } from "../entities/UserBadgesEntity";
import { injectable, inject } from "inversify";
import { Identifiers } from "../../../core/Identifiers";
import { v4 as uuidv4 } from "uuid";
import { UserBadgeRepository } from "../../../core/write/domain/repositories/UserBadgeRepository";
import { UserBadgesEntityMapper } from "./mappers/UserBadgesEntityMapper";
import { UserBadge } from "../../../core/write/domain/aggregates/UserBadge";

@injectable()
export class UserBadgesRepository implements UserBadgeRepository {
    private readonly userBadgesEntityMapper: UserBadgesEntityMapper;

    constructor(
        @inject(Identifiers.entityManager)
        private readonly entityManager: EntityManager
    ) {
        this.userBadgesEntityMapper = new UserBadgesEntityMapper(this.entityManager);
    }

    async findOne(options: FindOneOptions<UserBadgesEntity>): Promise<UserBadge | null> {
        const repository = this.entityManager.getRepository(UserBadgesEntity);
        const entity = await repository.findOne(options);
        return entity ? this.userBadgesEntityMapper.toDomain(entity) : null;
    }

    async findByUserId(userId: string): Promise<UserBadge[]> {
        console.log(userId);
        const repository = this.entityManager.getRepository(UserBadgesEntity);
        const entities = await repository.find({ where: { userId: userId } });
        return entities.map(entity => this.userBadgesEntityMapper.toDomain(entity));
    }

    async create(userId: string, badgeId: string): Promise<UserBadge> {
        const repository = this.entityManager.getRepository(UserBadgesEntity);
        const entity = repository.create({
            id: uuidv4(),
            badgeId,
            userId
        });
        await repository.save(entity);
        return this.userBadgesEntityMapper.toDomain(entity);
    }

    async save(userBadge: UserBadge): Promise<UserBadge> {
        const repository = this.entityManager.getRepository(UserBadgesEntity);
        const entity = this.userBadgesEntityMapper.fromDomain(userBadge);
        const savedEntity = await repository.save(entity);
        return this.userBadgesEntityMapper.toDomain(savedEntity);
    }

    async remove(userId: string, badgeId: string): Promise<void> {
        const repository = this.entityManager.getRepository(UserBadgesEntity);
        await repository.delete({ userId, badgeId });
    }

    async removeAllByBadgeId(badgeId: string): Promise<void> {
        const repository = this.entityManager.getRepository(UserBadgesEntity);
        await repository.delete({ badgeId });
    }
}
