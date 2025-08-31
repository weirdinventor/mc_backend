import {UserGender} from "../../write/domain/types/UserGender";
import {UserRole} from "../../write/domain/types/UserRole";
import {RolePermission} from "../../write/domain/types/RolePermissions";

export interface GroupRole {
    id: string;
    name: string;
    permissions: RolePermission[];
}

export interface GroupMembersReadModel {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    status: string;
    email: string;
    profilePicture: string;
    gender: UserGender;
    role: UserRole;
    isSubscribed: boolean;
    isOwner: boolean;
    groupRole: GroupRole;
    createdAt: Date;
    updatedAt: Date
}