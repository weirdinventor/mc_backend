import { FindOneOptions } from "typeorm";
import { BadgeEntity } from "../../../../adapters/repositories/entities/BadgeEntity";
import { Badge } from "../aggregates/Badge";

export interface BadgeRepository {
    findOne(options: FindOneOptions<BadgeEntity>): Promise<Badge | null>;
    create(data: Partial<BadgeEntity>): Badge;
    save(badge: Badge): Promise<Badge>;
    delete(badgeId: string): Promise<void>;
}
