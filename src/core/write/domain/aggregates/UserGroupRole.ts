import {v4} from "uuid";
import {AggregateRoot} from "../entities/AggregateRoot";
import {UserProperties} from "./User";
import {RoleProperties} from "./Role";
import {RoleAssigned} from "../../../../messages/events/userGroupRole/RoleAssigned";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";

export interface UserGroupRoleProperties {
    id: string;
    userId: string;
    groupId: string;
    roleId: string;
    user: UserProperties | null;
    role: RoleProperties | null;
}

export class UserGroupRole extends AggregateRoot<UserGroupRoleProperties> {
    static restore(props: UserGroupRoleProperties) {
        return new UserGroupRole(props);
    }

    static assignRoleToUser(props: {
        userId: string;
        groupId: string;
        roleId: string;
    }) {
        const {userId, groupId, roleId} = props;
        const userGroupRole = new UserGroupRole({
            id: v4(),
            userId,
            groupId,
            roleId,
            user: null,
            role: null,
        });

        userGroupRole.applyChange(
            new RoleAssigned({
                id: userGroupRole.props.id,
                userId,
                groupId,
                roleId,
            })
        );

        return userGroupRole;
    }

    @Handle(RoleAssigned)
    private applyRoleAssigned(event: RoleAssigned) {
        this.props.userId = event.props.userId;
        this.props.groupId = event.props.groupId;
        this.props.roleId = event.props.roleId;
    }
}
