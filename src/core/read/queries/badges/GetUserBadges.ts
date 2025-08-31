import { inject, injectable } from "inversify";
import { Identifiers } from "../../../Identifiers";
import { UserBadgeRepository } from "../../../write/domain/repositories/UserBadgeRepository";
import { BadgeRepository } from "../../../write/domain/repositories/BadgeRepository";
import { UserRepository } from "../../../write/domain/repositories/UserRepository";
import {UserErrors} from "../../../write/domain/errors/UserErrors";

export interface GetUserBadgesInput {
    userId: string;
}

export interface BadgeDto {
    id: string;
    name: string;
    description?: string;
    badgeType: string;
    pictureUrl?: string;
    earnedTimestamp: Date;
}

@injectable()
export class GetUserBadges {
    constructor(
        @inject(Identifiers.userBadgesRepository)
        private readonly _userBadgeRepository: UserBadgeRepository,
        @inject(Identifiers.badgeRepository)
        private readonly _badgeRepository: BadgeRepository,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository
    ) {}

    async execute(payload: GetUserBadgesInput): Promise<BadgeDto[]> {
        const { userId } = payload;

        // Verify user exists
        const user = await this._userRepository.getById(userId);
        if (!user) {
            throw new UserErrors.UserNotFound();
        }

        // Get all user badges
        const userBadges = await this._userBadgeRepository.findByUserId(userId);
        
        // Get badge details for each user badge
        const badgeDtos: BadgeDto[] = [];
        
        for (const userBadge of userBadges) {
            const badge = await this._badgeRepository.findOne({ 
                where: { id: userBadge.props.badgeId } 
            });
            
            if (badge) {
                badgeDtos.push({
                    id: badge.id,
                    name: badge.props.name,
                    description: badge.props.description,
                    badgeType: badge.props.badgeType,
                    pictureUrl: badge.props.pictureUrl,
                    earnedTimestamp: userBadge.props.earnedTimestamp
                });
            }
        }
        
        return badgeDtos;
    }
}