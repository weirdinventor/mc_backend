import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import {RolePermission} from "../../../core/write/domain/types/RolePermissions";
import {UserGroupRoleEntity} from "./UserGroupRoleEntity";
import {GroupEntity} from "./GroupEntity";

@Entity("role")
export class RoleEntity {
    @PrimaryColumn()
    id: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    name: string;

    @Column({
        nullable: false,
        type: "enum",
        enum: RolePermission,
        array: true,
        default: [RolePermission.SEND_MESSAGES, RolePermission.SEND_MEDIA],
    })
    permissions: RolePermission[];

    @Column({
        nullable: false,
        type: "varchar",
    })
    groupId: string;

    @ManyToOne(() => GroupEntity, (group) => group.roles, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    group: GroupEntity;

    @OneToMany(() => UserGroupRoleEntity, (userGroupRole) => userGroupRole.role)
    userGroupRoles: UserGroupRoleEntity[];

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
