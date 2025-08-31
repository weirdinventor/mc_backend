import {UserEntity} from "../../entities/UserEntity";
import {User} from "../../../../core/write/domain/aggregates/User";
import {EntityManager} from "typeorm";
import {Mapper} from "../../../../core/write/domain/models/Mapper";

export class UserEntityMapper implements Mapper<UserEntity, User> {
    constructor(private readonly entityManager: EntityManager) {
    }

    fromDomain(param: User): UserEntity {
        return this.entityManager.create(UserEntity, {
            id: param.id,
            email: param.props.email,
            phone: param.props.phone,
            password: param.props.password,
            status: param.props.status,
            role: param.props.role,
            recoveryCode: param.props.recoveryCode,
            isSubscribed: param.props.isSubscribed,
            currentGradeId: param.props.currentGradeId,
            lastActivityTimestamp: param.props.lastActivityTimestamp,
            lastDailyRewardTimestamp: param.props.lastDailyRewardTimestamp,
            experiencePoints: param.props.experiencePoints,
            blockedUsers: param.props.blockedUsers,
            createdAt: param.createdAt,
            updatedAt: param.updatedAt,
        });
    }

    toDomain(raw: UserEntity): User {
        const user = User.restore({
            id: raw.id,
            email: raw.email,
            phone: raw.phone,
            signInAt: raw.signInAt,
            password: raw.password,
            status: raw.status,
            role: raw.role,
            recoveryCode: raw.recoveryCode,
            isSubscribed: raw.isSubscribed,
            currentGradeId: raw.currentGradeId,
            lastActivityTimestamp: raw.lastActivityTimestamp,
            lastDailyRewardTimestamp: raw.lastDailyRewardTimestamp,
            experiencePoints: raw.experiencePoints,
            blockedUsers: raw.blockedUsers
        });
        user.createdAt = raw.createdAt;
        user.updatedAt = raw.updatedAt;
        return user;
    }
}
