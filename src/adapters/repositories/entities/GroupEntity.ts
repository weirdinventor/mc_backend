import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";
import {GroupPermission} from "../../../core/write/domain/types/GroupPermissions";
import {UserGroupRoleEntity} from "./UserGroupRoleEntity";
import {UserEntity} from "./UserEntity";
import {RoleEntity} from "./RoleEntity";
import {LiveEntity} from "./LiveEntity";
import {ResourceEntity} from "./ResourceEntity";
import {MembershipsEntity} from "./MembershipsEntity";
import {ModulePurchaseEntity} from "./ModulePurchaseEntity";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";

@Entity("group")
export class GroupEntity {
    @PrimaryColumn()
    id: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    coverImage?: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    thumbnail?: string;

    @Column({
        nullable: true,
        type: "varchar",
        default: null
    })
    emoji: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    name: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    subject: string;

    @Column({
        nullable: false,
        type: "enum",
        enum: GroupPermission,
        array: true,
        default: [GroupPermission.SEND_MESSAGES, GroupPermission.SEND_MEDIA],
    })
    permissions: GroupPermission[];

    @Column({
        nullable: false,
        type: "varchar",
    })
    ownerId: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    voiceRoomId: string;

    @Column({
        type: "boolean",
        default: false,
    })
    isModule: boolean;

    @Column({
        type: 'enum',
        enum: AccessLevel,
        default: AccessLevel.FREE
    })
    accessLevel: AccessLevel;

    @ManyToOne(() => UserEntity, (user) => user.ownedGroups)
    owner: UserEntity;

    @OneToMany(() => MembershipsEntity, membership => membership.group)
    members: MembershipsEntity[];

    @OneToMany(() => RoleEntity, (role) => role.group, {
        cascade: true,
        eager: true,
    })
    roles: RoleEntity[];

    @OneToMany(() => UserGroupRoleEntity, (userGroupRole) => userGroupRole.group)
    userGroupRoles: UserGroupRoleEntity[];

    @OneToMany(() => LiveEntity, live => live.group)
    lives: LiveEntity[];

    @OneToMany(() => ModulePurchaseEntity, purchase => purchase.module)
    modulePurchase: ModulePurchaseEntity[];

    @OneToMany(() => ResourceEntity, (resource) => resource.group)
    resources: ResourceEntity[];

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
