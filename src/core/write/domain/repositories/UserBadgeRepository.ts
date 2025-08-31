import { FindOneOptions } from "typeorm";
import { UserBadgesEntity } from "../../../../adapters/repositories/entities/UserBadgesEntity";
import { UserBadge } from "../aggregates/UserBadge";

export interface UserBadgeRepository {
    findOne(options: FindOneOptions<UserBadgesEntity>): Promise<UserBadge | null>;
    findByUserId(userId: string): Promise<UserBadge[]>;
    create(userId: string, badgeId: string): Promise<UserBadge>;
    save(userBadge: UserBadge): Promise<UserBadge>;
    remove(userId: string, badgeId: string): Promise<void>;
    removeAllByBadgeId(badgeId: string): Promise<void>;
}
