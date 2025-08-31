import { injectable, inject } from "inversify";
import { Identifiers } from "../../core/Identifiers";
import { UserRepository } from "../../core/write/domain/repositories/UserRepository";
import { GradeRepository } from "../../core/write/domain/repositories/GradeRepository";
import { AccessLevel } from "../../core/write/domain/types/AccessLevel";
import { UserModuleProgressRepository } from "../../core/write/domain/repositories/UserModuleProgressRepository";
import { BadgeRepository } from "../../core/write/domain/repositories/BadgeRepository";
import { UserBadgeRepository } from "../../core/write/domain/repositories/UserBadgeRepository";
import { GamificationConstants } from "../../core/write/domain/types/GamificationConstants";

@injectable()
export class GamificationService {
    constructor(
        @inject(Identifiers.userRepository)
        private readonly userRepository: UserRepository,
        @inject(Identifiers.gradeRepository)
        private readonly gradeRepository: GradeRepository,
        @inject(Identifiers.userModuleProgressRepository)
        private readonly userModuleProgressRepository: UserModuleProgressRepository,
        @inject(Identifiers.badgeRepository)
        private readonly badgeRepository: BadgeRepository,
        @inject(Identifiers.userBadgesRepository)
        private readonly userBadgesRepository: UserBadgeRepository
    ) {}

    async awardXp(userId: string, points: number): Promise<void> {
        const user = await this.userRepository.getById(userId);
        if (!user) throw new Error('User not found');

        user.props.experiencePoints += points;
        user.props.lastActivityTimestamp = new Date();

        await this.userRepository.save(user);

        await this.updateUserGrade(userId);
    }

    async updateUserGrade(userId: string): Promise<void> {
        const user = await this.userRepository.getById(userId);
        if (!user) throw new Error('User not found');


        const grades = await this.gradeRepository.findAll({
            minXpRequired: user.props.experiencePoints,
            userTypeAccess: user.props.isSubscribed ? AccessLevel.PREMIUM : AccessLevel.FREE 
        });

        if (grades.length > 0 && grades[0].id !== user.props.currentGradeId) {
            user.props.currentGradeId = grades[0].id;
            await this.userRepository.save(user);
        }
    }

    async checkAndGrantDailyReward(userId: string): Promise<boolean> {
        const user = await this.userRepository.getById(userId);
        if (!user) throw new Error('User not found');

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (!user.props.lastDailyRewardTimestamp || user.props.lastDailyRewardTimestamp < startOfDay) {
            await this.awardXp(userId, GamificationConstants.DAILY_REWARD_XP);
            user.props.lastDailyRewardTimestamp = now;
            await this.userRepository.save(user);
            return true;
        }
        return false;
    }

    async incrementModuleMessageCount(userId: string, moduleId: string): Promise<number> {
        let progress = await this.userModuleProgressRepository.findOne({ where: { userId, moduleId } });

        if (!progress) {
            progress = this.userModuleProgressRepository.create({
                userId,
                moduleId,
                completionStatus: 'NotStarted',
                discussionMessageCount: 0,
            });
        }

        progress.props.discussionMessageCount += 1;
        await this.userModuleProgressRepository.save(progress);

        return progress.props.discussionMessageCount;
    }

    async awardModuleExpertContributorBadge(userId: string, moduleId: string): Promise<void> {
        const badge = await this.badgeRepository.findOne({ 
            where: { 
                badgeType: 'Module_Expert_Contributor'
            } 
        });
        if (!badge) return;

        const existingUserBadge = await this.userBadgesRepository.findOne({ where: { userId, badgeId: badge.id } });
        if (!existingUserBadge) {
            const userBadge = await this.userBadgesRepository.create(
                userId, 
                badge.id,
                );
        }
    }
}
