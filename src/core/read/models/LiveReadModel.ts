import {LiveStatus} from "../../write/domain/types/LiveStatus";
import {AccessLevel} from "../../write/domain/types/AccessLevel";
import {UserEntity} from "../../../adapters/repositories/entities/UserEntity";
import {LiveCategoryEntity} from "../../../adapters/repositories/entities/LiveCategoryEntity";
import {NotificationEntity} from "../../../adapters/repositories/entities/NotificationEntity";
import {RecordEntity} from "../../../adapters/repositories/entities/RecordEntity";
import {Group, GroupProperties} from "../../write/domain/aggregates/Group";
import {GroupEntity} from "../../../adapters/repositories/entities/GroupEntity";
import {RecordProperties} from "../../write/domain/aggregates/Record";


export interface LiveOwnerReadModel {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null
}

export interface LiveReadModel {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    status: LiveStatus;
    duration: number;
    accessLevel: AccessLevel;
    airsAt: Date;
    canceledAt: Date;
    ownerId: string;
    roomId?: string;
    owner?: LiveOwnerReadModel;
    categoryId: string;
    interestedUsers: LiveOwnerReadModel[];
    category?: LiveCategoryEntity;
    group?: GroupProperties;
    record?: RecordProperties;
    notifications: NotificationEntity[];
    moderators: UserEntity[];
    createdAt?: Date;
    updatedAt?: Date;
}