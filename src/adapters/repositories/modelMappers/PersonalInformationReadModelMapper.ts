import {BadgeInfo, GradeInfo, PersonalInformationReadModel} from "../../../core/read/models/PersonalInformationReadModel";
import {Mapper} from "../../../core/write/domain/models/Mapper";

export class PersonalInformationReadModelMapper implements Mapper<any, PersonalInformationReadModel> {
    toDomain(raw: any): PersonalInformationReadModel {
        if (!raw) return null;

        // Map grade information if available
        let currentGrade: GradeInfo = null;
        if (raw.gradeId) {
            currentGrade = {
                id: raw.gradeId,
                name: raw.gradeName,
                animationAssetUrl: raw.animationAssetUrl
            };
        }

        // Map badges if available
        let badges: BadgeInfo[] = [];
        if (raw.badges && Array.isArray(raw.badges)) {
            badges = raw.badges.map(badge => ({
                id: badge.badgeId,
                name: badge.name,
                description: badge.description,
                pictureUrl: badge.pictureUrl,
                earnedTimestamp: new Date(badge.earnedTimestamp)
            }));
        }

        return {
            id: raw.id,
            firstName: raw.firstName,
            lastName: raw.lastName,
            username: raw.username,
            status: raw.status,
            email: raw.email,
            role: raw.role,
            profilePicture: raw.profilePicture,
            gender: raw.gender,
            isSubscribed: raw.isSubscribed,
            experiencePoints: raw.experiencePoints,
            currentGrade: currentGrade,
            badges: badges.length > 0 ? badges : undefined,
            createdAt: new Date(raw.createdAt),
            updatedAt: new Date(raw.updatedAt),
            deletedAt: raw.deletedAt !== null ? new Date(raw.deletedAt) : null
        };
    }
}
