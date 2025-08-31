import {UserRole} from "../../write/domain/types/UserRole";
import {UserGender} from "../../write/domain/types/UserGender";

export interface GradeInfo {
    id: string;
    name: string;
    animationAssetUrl?: string;
}

export interface BadgeInfo {
    id: string;
    name: string;
    description?: string;
    pictureUrl?: string;
    badgeType: string;
    earnedTimestamp: Date;
}

export interface PersonalInformationReadModel {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    status: string,
    email: string,
    profilePicture: string,
    gender: UserGender,
    role: UserRole,
    isSubscribed: boolean,
    experiencePoints?: number,
    currentGrade?: GradeInfo,
    badges?: BadgeInfo[],
    createdAt: Date,
    updatedAt: Date
    deletedAt: Date
}
