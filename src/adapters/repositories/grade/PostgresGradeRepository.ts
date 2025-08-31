import { inject, injectable } from "inversify";
import { GradeRepository } from "../../../core/write/domain/repositories/GradeRepository";
import { EntityManager, LessThanOrEqual } from "typeorm";
import { Identifiers } from "../../../core/Identifiers";
import { AccessLevel } from "../../../core/write/domain/types/AccessLevel";
import { Grade } from "../../../core/write/domain/aggregates/Grade";
import { GradeEntity } from "../entities/GradeEntity";
import { GradeEntityMapper } from "./mappers/GradeEntityMapper";

@injectable()
export class PostgresGradeRepository implements GradeRepository {
    private readonly gradeEntityMapper: GradeEntityMapper;
    constructor(
        @inject(Identifiers.entityManager)
        private readonly entityManager: EntityManager
    ) {
        this.gradeEntityMapper = new GradeEntityMapper(this.entityManager);
    }

    async findAll(filters: {
        minXpRequired: number;
        userTypeAccess: AccessLevel
    }): Promise<Grade[]> {
        const gradeRepository = this.entityManager.getRepository(GradeEntity);
        const gradeEntities = await gradeRepository.find({
            where: {
                minXpRequired: LessThanOrEqual(filters.minXpRequired),
                userTypeAccess: filters.userTypeAccess 
            },
            order: { minXpRequired: 'DESC' }
        })
        
        return gradeEntities.map(gradeEntity => this.gradeEntityMapper.toDomain(gradeEntity));
    }


}
