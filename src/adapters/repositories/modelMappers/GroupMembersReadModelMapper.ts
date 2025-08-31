import {GroupMembersReadModel} from "../../../core/read/models/GroupMembersReadModel";
import {Mapper} from "../../../core/write/domain/models/Mapper";
import {GroupPermission} from "../../../core/write/domain/types/GroupPermissions";


export class GroupMembersReadModelMapper implements Mapper<any, GroupMembersReadModel> {

    toDomain(raw: any): GroupMembersReadModel {
        if (!raw) return null

        return {
            id: raw.u_id,
            firstName: raw.p_firstName,
            lastName: raw.p_lastName,
            username: raw.p_username,
            email: raw.u_email,
            status: raw.u_status,
            profilePicture: raw.p_profilePicture,
            gender: raw.p_gender,
            role: raw.u_role,
            isSubscribed: raw.u_isSubscribed,
            isOwner: raw.g_ownerId === raw.u_id,
            groupRole: raw.grouproleid ? {
                id: raw.grouproleid,
                name: raw.grouprolename,
                permissions: raw.grouprolepermissions
                    .replace(/[{}]/g, '')
                    .split(',')
                    .map(Number)
                    .map(perm => GroupPermission[perm])
            } : undefined,
            createdAt: raw.u_createdAt,
            updatedAt: raw.u_updatedAt
        }

    }
}