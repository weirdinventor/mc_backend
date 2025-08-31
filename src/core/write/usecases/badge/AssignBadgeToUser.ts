import { inject, injectable } from "inversify";
import { Usecase } from "../../domain/models/Usecase";
import { Identifiers } from "../../../Identifiers";
import { BadgeRepository } from "../../domain/repositories/BadgeRepository";
import { UserBadgeRepository } from "../../domain/repositories/UserBadgeRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { BadgeNotFoundError } from "../../domain/errors/BadgeErrors";
import {UserErrors} from "../../domain/errors/UserErrors";

export interface AssignBadgeToUserInput {
    userId: string;
    badgeId: string;
}

@injectable()
export class AssignBadgeToUser implements Usecase<AssignBadgeToUserInput, void> {
    constructor(
        @inject(Identifiers.badgeRepository)
        private readonly _badgeRepository: BadgeRepository,
        @inject(Identifiers.userBadgesRepository)
        private readonly _userBadgeRepository: UserBadgeRepository,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository
    ) {}

    async execute(payload: AssignBadgeToUserInput): Promise<void> {
        const { userId, badgeId } = payload;

        // Verify user exists
        const user = await this._userRepository.getById(userId);
        if (!user) {
            throw new UserErrors.UserNotFound();
        }

        // Verify badge exists
        const badge = await this._badgeRepository.findOne({ where: { id: badgeId } });
        if (!badge) {
            throw new BadgeNotFoundError();
        }

        // Check if the user already has this badge
        const existingUserBadge = await this._userBadgeRepository.findOne({ 
            where: { userId, badgeId } 
        });
        
        if (!existingUserBadge) {
            // Create and save the user badge
            const userBadge = await this._userBadgeRepository.create(
                userId, 
                badgeId
            );
            await this._userBadgeRepository.save(userBadge);
        }
    }
}