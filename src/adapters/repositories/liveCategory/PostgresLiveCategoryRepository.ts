import {LiveCategoryRepository} from "../../../core/write/domain/repositories/LiveCategoryRepository";
import {EntityManager} from "typeorm";
import {LiveCategoryEntityMapper} from "./mappers/LiveCategoryEntityMapper";
import {LiveCategory} from "../../../core/write/domain/aggregates/LiveCategory";
import {LiveCategoryEntity} from "../entities/LiveCategoryEntity";


export class PostgresLiveCategoryRepository implements LiveCategoryRepository {

    private readonly liveCategoryEntityMapper: LiveCategoryEntityMapper;

    constructor(
        private readonly entityManager: EntityManager
    ) {
        this.liveCategoryEntityMapper = new LiveCategoryEntityMapper(this.entityManager);
    }

    async getAll(): Promise<LiveCategory[]> {
        const liveCategoryRepo = this.entityManager.getRepository(LiveCategoryEntity);
        const liveCategories = await liveCategoryRepo.find();
        return liveCategories.map((liveCategory) => this.liveCategoryEntityMapper.toDomain(liveCategory));
    }

    async getOne(id: string): Promise<LiveCategory> {
        const liveCategoryRepo = this.entityManager.getRepository(LiveCategoryEntity);
        const liveCategoryEntity = await liveCategoryRepo.findOne({
            where: {
                id
            }

        });

        if (!liveCategoryEntity) {
            return null;
        }

        return this.liveCategoryEntityMapper.toDomain(liveCategoryEntity);
    }

    async create(payload: LiveCategory): Promise<LiveCategory> {
        const liveCategoryRepo = this.entityManager.getRepository(LiveCategoryEntity);
        const liveCategoryEntity = this.liveCategoryEntityMapper.fromDomain(payload);

        const savedLiveCategory = await liveCategoryRepo.save(liveCategoryEntity);
        return this.liveCategoryEntityMapper.toDomain(savedLiveCategory);
    }

    async update(payload: { id: string; name: string }): Promise<LiveCategory> {
        const liveCategoryRepo = this.entityManager.getRepository(LiveCategoryEntity);
        const liveCategoryEntity = await liveCategoryRepo.findOne({
            where: {
                id: payload.id
            }
        });

        liveCategoryEntity.name = payload.name;
        const updatedLiveCategory = await liveCategoryRepo.save(liveCategoryEntity);
        return this.liveCategoryEntityMapper.toDomain(updatedLiveCategory);
    }

    async delete(id: string): Promise<void> {
        const liveCategoryRepo = this.entityManager.getRepository(LiveCategoryEntity);
        await liveCategoryRepo.delete(id);
    }
}