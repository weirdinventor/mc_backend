import { inject, injectable } from "inversify";
import { Usecase } from "../../domain/models/Usecase";
import { Identifiers } from "../../../Identifiers";
import { BadgeRepository } from "../../domain/repositories/BadgeRepository";
import { UserBadgeRepository } from "../../domain/repositories/UserBadgeRepository";
import { BadgeNotFoundError } from "../../domain/errors/BadgeErrors";

export interface DeleteBadgeInput {
    badgeId: string;
}

@injectable()
export class DeleteBadge implements Usecase<DeleteBadgeInput, void> {
    constructor(
        @inject(Identifiers.badgeRepository)
        private readonly _badgeRepository: BadgeRepository,
        @inject(Identifiers.userBadgesRepository)
        private readonly _userBadgeRepository: UserBadgeRepository
    ) {}

    async execute(payload: DeleteBadgeInput): Promise<void> {
        const { badgeId } = payload;

        // Verify badge exists
        const badge = await this._badgeRepository.findOne({ where: { id: badgeId } });
        if (!badge) {
            throw new BadgeNotFoundError();
        }

        // Remove all badge assignments for this badge
        await this._userBadgeRepository.removeAllByBadgeId(badgeId);

        // Delete the badge
        await this._badgeRepository.delete(badgeId);
    }
}