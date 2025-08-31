import {GroupEntity} from "../../../../adapters/repositories/entities/GroupEntity";
import {UserEntity} from "../../../../adapters/repositories/entities/UserEntity";
import {RoleEntity} from "../../../../adapters/repositories/entities/RoleEntity";

export interface GroupMemberDtoProperties {
    member: UserEntity;
    role: RoleEntity
}

export class GroupMemberDto {
    groupMembers: GroupMemberDtoProperties[];

    constructor(props: GroupEntity) {
        const { roles, userGroupRoles} = props;
        this.groupMembers = [].map((member) => {
            const role = roles.find((role) => {
                return userGroupRoles.some((userGroupRole) => {
                    return userGroupRole.roleId === role.id && userGroupRole.userId === member.id;
                });
            });

            return {
                member,
                role: role || null
            }
        });
    }
}