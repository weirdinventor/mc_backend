import { Mapper } from "../../../../core/write/domain/models/Mapper";
import { UserModuleProgress, CompletionStatus } from "../../../../core/write/domain/aggregates/UserModuleProgress";
import { UserModuleProgressEntity } from "../../entities/UserModuleProgressEntity";
import { EntityManager } from "typeorm";
import { v4 as uuidv4 } from "uuid";

export class UserModuleProgressEntityMapper implements Mapper<UserModuleProgressEntity, UserModuleProgress> {
    constructor(
        private readonly entityManager: EntityManager
    ) {}
    
    fromDomain(param: UserModuleProgress): UserModuleProgressEntity {
        return this.entityManager.create(UserModuleProgressEntity, {
            id: param.id,
            userId: param.props.userId,
            moduleId: param.props.moduleId,
            completionStatus: param.props.completionStatus,
            discussionMessageCount: param.props.discussionMessageCount,
        });
    }

    toDomain(param: UserModuleProgressEntity): UserModuleProgress {
        return UserModuleProgress.restore({
            id: param.id,
            userId: param.userId,
            moduleId: param.moduleId,
            completionStatus: param.completionStatus as CompletionStatus,
            discussionMessageCount: param.discussionMessageCount,
        });
    }
}