import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    JoinTable,
    ManyToMany, ManyToOne,
    OneToMany, OneToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

import {LiveStatus} from "../../../core/write/domain/types/LiveStatus";
import {NotificationEntity} from "./NotificationEntity";
import {UserEntity} from "./UserEntity";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";
import {LiveCategoryEntity} from "./LiveCategoryEntity";
import {GroupEntity} from "./GroupEntity";
import {RecordEntity} from "./RecordEntity";

@Entity("live")
export class LiveEntity {
    @PrimaryColumn()
    id: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    title: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    description: string;

    @Column({
        nullable: true,
        type: "varchar",
    })
    coverImage: string;

    @Column({
        nullable: false,
        type: "enum",
        enum: LiveStatus,
        default: LiveStatus.DRAFT,
    })
    status: LiveStatus;

    @Column({
        nullable: false,
        type: "int",
        default: 60
    })
    duration: number;

    @Column({
        nullable: false,
        type: "enum",
        enum: AccessLevel,
        default: AccessLevel.FREE
    })
    accessLevel: AccessLevel;

    @Column({
        nullable: true,
    })
    airsAt?: Date;

    @Column({
        default: null,
    })
    roomId: string;

    @Column({
        nullable: true,
    })
    canceledAt?: Date;

    @CreateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt?: Date;

    @UpdateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    updatedAt?: Date;

    // Owner relation
    @ManyToOne(() => UserEntity, (user) => user.posts)
    @JoinColumn({name: "ownerId"})
    owner: UserEntity;

    @Column({
        default: null,
    })
    ownerId: string;


    @ManyToOne(() => LiveCategoryEntity, (category) => category.lives)
    @JoinColumn({
        name: "categoryId"
    })
    category: LiveCategoryEntity;

    @Column({
        default: null,
    })
    categoryId: string;


    @ManyToOne(() => GroupEntity, (group) => group.lives)
    @JoinColumn({
        name: "groupId"
    })
    group: GroupEntity;

    @Column({
        nullable: true,
        type: "varchar",
        default: null
    })
    groupId: string;

    @ManyToMany(() => UserEntity, {cascade: true})
    @JoinTable({
        name: "live_interested_users"
    })
    interestedUsers: UserEntity[];

    // Notification relation
    @OneToMany(() => NotificationEntity, (notification) => notification.live)
    notifications: NotificationEntity[];

    // Moderator relation
    @ManyToMany(() => UserEntity, {cascade: true})
    @JoinTable()
    moderators: UserEntity[];

    @OneToOne(() => RecordEntity)
    @JoinColumn({
        name: "recordId"
    })
    record: RecordEntity;
}
