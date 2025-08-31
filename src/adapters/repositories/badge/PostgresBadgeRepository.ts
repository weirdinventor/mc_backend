import { EntityManager, FindOneOptions } from "typeorm";
import { BadgeEntity } from "../entities/BadgeEntity";
import { injectable, inject } from "inversify";
import { Identifiers } from "../../../core/Identifiers";
import { BadgeRepository as BadgeRepositoryInterface } from "../../../core/write/domain/repositories/BadgeRepository";
import { BadgeEntityMapper } from "./mappers/BadgeEntityMapper";
import { Badge } from "../../../core/write/domain/aggregates/Badge";

@injectable()
export class PostgresBadgeRepository implements BadgeRepositoryInterface {
    private readonly badgeEntityMapper: BadgeEntityMapper;

    constructor(
        @inject(Identifiers.entityManager)
        private readonly entityManager: EntityManager
    ) {
        this.badgeEntityMapper = new BadgeEntityMapper(this.entityManager);
    }

    async findOne(options: FindOneOptions<BadgeEntity>): Promise<Badge | null> {
        const repository = this.entityManager.getRepository(BadgeEntity);
        const entity = await repository.findOne(options);
        return entity ? this.badgeEntityMapper.toDomain(entity) : null;
    }

    create(data: Partial<BadgeEntity>): Badge {
        const repository = this.entityManager.getRepository(BadgeEntity);
        const entity = repository.create(data);
        return this.badgeEntityMapper.toDomain(entity);
    }

    async save(badge: Badge): Promise<Badge> {
        const repository = this.entityManager.getRepository(BadgeEntity);
        const entity = this.badgeEntityMapper.fromDomain(badge);
        const savedEntity = await repository.save(entity);
        return this.badgeEntityMapper.toDomain(savedEntity);
    }

    async delete(badgeId: string): Promise<void> {
        const repository = this.entityManager.getRepository(BadgeEntity);
        await repository.delete({ id: badgeId });
    }
}
