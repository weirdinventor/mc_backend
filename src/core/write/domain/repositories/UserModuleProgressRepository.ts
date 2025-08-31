import { FindOneOptions } from "typeorm";
import { UserModuleProgressEntity } from "../../../../adapters/repositories/entities/UserModuleProgressEntity";
import { UserModuleProgress } from "../aggregates/UserModuleProgress";

export interface UserModuleProgressRepository {
    findOne(options: FindOneOptions<UserModuleProgressEntity>): Promise<UserModuleProgress | null>;
    create(data: Partial<UserModuleProgressEntity>): UserModuleProgress;
    save(userModuleProgress: UserModuleProgress): Promise<UserModuleProgress>;
}
