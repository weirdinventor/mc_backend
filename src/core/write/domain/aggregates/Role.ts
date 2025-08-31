import {v4} from "uuid";
import {AggregateRoot} from "../entities/AggregateRoot";
import {RolePermission} from "../types/RolePermissions";
import {RoleCreated} from "../../../../messages/events/role/RoleCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {RoleDeleted} from "../../../../messages/events/role/RoleDeleted";
import {RoleUpdated} from "../../../../messages/events/role/RoleUpdated";

export interface RoleProperties {
    id: string;
    name: string;
    permissions: RolePermission[];
    groupId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Role extends AggregateRoot<RoleProperties> {
    static restore(props: RoleProperties) {
        return new Role(props);
    }

    static createRole(props: {
        name: string;
        permissions?: RolePermission[];
        groupId: string;
    }) {
        const {name, permissions, groupId} = props;
        const role = new Role({
            id: v4(),
            name,
            groupId,
            permissions: permissions || [
                RolePermission.SEND_MESSAGES,
                RolePermission.SEND_MEDIA,
            ]
        });

        role.applyChange(
            new RoleCreated({
                id: role.props.id,
                groupId: groupId,
                name: name,
                permissions: permissions
            })
        );

        return role;
    }

    @Handle(RoleCreated)
    private applyRoleCreated(event: RoleCreated) {
        this.props.id = event.props.id;
        this.props.name = event.props.name;
        this.props.permissions = event.props.permissions;
        this.props.groupId = event.props.groupId;
    }

    updateRole(props: {
        id: string;
        name: string;
        permissions?: RolePermission[];
    }) {
        const {id, name, permissions} = props;

        this.applyChange(
            new RoleUpdated({
                id: id,
                name: name,
                permissions: permissions
            })
        );

        return this;
    }

    @Handle(RoleUpdated)
    private applyRoleUpdated(event: RoleUpdated) {
        this.props.id = event.props.id;
        this.props.name = event.props.name;
        this.props.permissions = event.props.permissions;
    }

    deleteRole(roleId: string) {

        this.applyChange(
            new RoleDeleted({
                id: roleId,
            })
        );

        return this;
    }

    @Handle(RoleDeleted)
    private applyRoleDeleted(event: RoleDeleted) {
        this.props.id = event.props.id;
    }
}
