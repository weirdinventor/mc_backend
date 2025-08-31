import {UserGroupRole} from "../aggregates/UserGroupRole";

export interface UserGroupRoleRepository {
    assignRoleToUser(ugr: UserGroupRole): Promise<UserGroupRole>;

    isRoleAssigned(payload: {
        userId: string;
        groupId: string;
        roleId: string;
    }): Promise<boolean>;
}
