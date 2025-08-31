import {GroupPermission} from "../types/GroupPermissions";
import {GroupEntity} from "../../../../adapters/repositories/entities/GroupEntity";

export interface GroupDtoProperties {
    id: string;
    name: string;
    emoji: string;
    subject: string;
    coverImage: string | null;
    permissions: GroupPermission[];
    ownerId: string;
}

export class GroupDto {
    group: GroupDtoProperties;

    constructor(group: GroupEntity) {
        const {
            id,
            name,
            emoji,
            subject,
            coverImage,
            permissions,
            ownerId
        } = group;

        this.group = {
            id,
            name,
            emoji,
            subject,
            coverImage,
            permissions,
            ownerId
        }
    }
}
