import { inject, injectable } from "inversify";
import { Usecase } from "../../domain/models/Usecase";
import { Identifiers } from "../../../Identifiers";
import { BadgeRepository } from "../../domain/repositories/BadgeRepository";
import { UserBadgeRepository } from "../../domain/repositories/UserBadgeRepository";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { BadgeNotFoundError } from "../../domain/errors/BadgeErrors";
import { UserErrors } from "../../domain/errors/UserErrors";

export interface RemoveBadgeFromUserInput {
    userId: string;
    badgeId: string;
}

@injectable()
export class RemoveBadgeFromUser implements Usecase<RemoveBadgeFromUserInput, void> {
    constructor(
        @inject(Identifiers.badgeRepository)
        private readonly _badgeRepository: BadgeRepository,
        @inject(Identifiers.userBadgesRepository)
        private readonly _userBadgeRepository: UserBadgeRepository,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository
    ) {}

    async execute(payload: RemoveBadgeFromUserInput): Promise<void> {
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

        // Remove the badge from the user
        await this._userBadgeRepository.remove(userId, badgeId);
    }
}