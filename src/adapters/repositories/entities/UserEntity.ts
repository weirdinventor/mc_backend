import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    OneToOne,
    JoinColumn
} from "typeorm";
import {AccountStatus} from "../../../core/write/domain/types/AccountStatus";
import {UserGroupRoleEntity} from "./UserGroupRoleEntity";
import {GroupEntity} from "./GroupEntity";

import {LiveEntity} from "./LiveEntity";
import {UserRole} from "../../../core/write/domain/types/UserRole";
import {PostEntity} from "./PostEntity";
import {ConversationEntity} from "./ConversationEntity";
import {ResourceEntity} from "./ResourceEntity";
import {MembershipsEntity} from "./MembershipsEntity";
import {ModulePurchaseEntity} from "./ModulePurchaseEntity";
import {SubscriptionEntity} from "./SubscriptionEntity";
import {ReactionEntity} from "./ReactionEntity";
import {GradeEntity} from "./GradeEntity";
import {UserBadgesEntity} from "./UserBadgesEntity";

@Entity("users")
export class UserEntity {
    @PrimaryColumn()
    id: string;

    @Index()
    @Column({
        nullable: false,
        type: "varchar",
        unique: true,
    })
    email: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    password: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    phone: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    signInAt: Date;

    @Column({
        nullable: false,
        type: "varchar",
        default: AccountStatus.INACTIVE,
    })
    status: AccountStatus;

    @Column({
        nullable: false,
        type: "varchar",
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({
        nullable: true,
        type: "varchar",
    })
    recoveryCode: string;

    @Column({
        default: false,
        type: "boolean",
    })
    isSubscribed: boolean;

    @Column({
        type: "jsonb",
        default: []
    })
    blockedUsers: string[];

    @Column({
        nullable: false,
        type: "integer",
        default: 0,
    })
    experiencePoints: number;

    @Column({
        nullable: true,
        type: "uuid",
    })
    currentGradeId: string;

    @Column({
        nullable: true,
        type: "timestamp",
    })
    lastActivityTimestamp: Date;

    @Column({
        nullable: true,
        type: "timestamp",
    })
    lastDailyRewardTimestamp: Date;

    @OneToMany(() => GroupEntity, (group) => group.owner)
    ownedGroups: GroupEntity[];

    @OneToMany(() => UserGroupRoleEntity, (userGroupRole) => userGroupRole.user)
    userGroupRoles: UserGroupRoleEntity[];

    @OneToMany(() => PostEntity, (post) => post.author)
    posts: PostEntity[];

    @OneToMany(() => ResourceEntity, (resource) => resource.author)
    resources: ResourceEntity[];

    @OneToMany(() => LiveEntity, (post) => post.owner)
    ownedPosts: LiveEntity[];

    @OneToMany(() => MembershipsEntity, membership => membership.user)
    members: MembershipsEntity[];

    // Purchase relationship
    @OneToMany(() => ModulePurchaseEntity, purchase => purchase.user)
    modulePurchase: ModulePurchaseEntity[];

    @OneToMany(() => ConversationEntity, (conversation) => conversation.starterUser)
    starters: ConversationEntity[];

    @OneToMany(() => ConversationEntity, (conversation) => conversation.participantUser)
    participants: ConversationEntity[];

    @OneToOne(() => SubscriptionEntity, (subscription) => subscription.user)
    subscription: SubscriptionEntity;

    @OneToOne(() => GradeEntity)
    @JoinColumn({ name: "currentGradeId" })
    currentGrade: GradeEntity;

    @OneToMany(() => ReactionEntity, (reaction) => reaction.user)
    reactions: ReactionEntity[];

    @OneToMany(() => UserBadgesEntity, (badge) => badge.user)
    badges: UserBadgesEntity[];

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
