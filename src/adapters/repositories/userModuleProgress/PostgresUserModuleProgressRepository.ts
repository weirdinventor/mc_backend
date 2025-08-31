import { EntityManager, FindOneOptions } from "typeorm";
import { UserModuleProgressEntity } from "../entities/UserModuleProgressEntity";
import { injectable, inject } from "inversify";
import { Identifiers } from "../../../core/Identifiers";
import { v4 as uuidv4 } from "uuid";
import { UserModuleProgressRepository as UserModuleProgressRepositoryInterface } from "../../../core/write/domain/repositories/UserModuleProgressRepository";
import { UserModuleProgressEntityMapper } from "./mappers/UserModuleProgressEntityMapper";
import { UserModuleProgress } from "../../../core/write/domain/aggregates/UserModuleProgress";

@injectable()
export class PostgresUserModuleProgressRepository implements UserModuleProgressRepositoryInterface {
    private readonly userModuleProgressEntityMapper: UserModuleProgressEntityMapper;

    constructor(
        @inject(Identifiers.entityManager)
        private readonly entityManager: EntityManager
    ) {
        this.userModuleProgressEntityMapper = new UserModuleProgressEntityMapper(this.entityManager);
    }

    async findOne(options: FindOneOptions<UserModuleProgressEntity>): Promise<UserModuleProgress | null> {
        const repository = this.entityManager.getRepository(UserModuleProgressEntity);
        const entity = await repository.findOne(options);
        return entity ? this.userModuleProgressEntityMapper.toDomain(entity) : null;
    }

    create(data: Partial<UserModuleProgressEntity>): UserModuleProgress {
        const repository = this.entityManager.getRepository(UserModuleProgressEntity);
        const entity = repository.create({
            id: uuidv4(),
            ...data
        });
        return this.userModuleProgressEntityMapper.toDomain(entity);
    }

    async save(userModuleProgress: UserModuleProgress): Promise<UserModuleProgress> {
        const repository = this.entityManager.getRepository(UserModuleProgressEntity);
        const entity = this.userModuleProgressEntityMapper.fromDomain(userModuleProgress);
        const savedEntity = await repository.save(entity);
        return this.userModuleProgressEntityMapper.toDomain(savedEntity);
    }
}
