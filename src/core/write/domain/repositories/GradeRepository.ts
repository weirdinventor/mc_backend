import { GradeEntity } from "../../../../adapters/repositories/entities/GradeEntity";
import { Grade } from "../aggregates/Grade";
import { AccessLevel } from "../types/AccessLevel";

export interface GradeRepository {
    findAll(filters: {
                minXpRequired: number;
                userTypeAccess: AccessLevel
            }
    ): Promise<Grade[]>;
}
