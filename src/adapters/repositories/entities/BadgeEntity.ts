import {
    Column,
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn, OneToMany
} from "typeorm";
import { GroupEntity } from "./GroupEntity";
import {UserBadgesEntity} from "./UserBadgesEntity";

@Entity("badges")
export class BadgeEntity {
    @PrimaryColumn({
        type: "uuid",
    })
    id: string;

    @Column({
        nullable: false,
        type: "varchar",
        unique: true,
    })
    name: string;

    @Column({
        nullable: true,
        type: "text",
    })
    description: string;

    @Column({
        nullable: false,
        type: "enum",
        enum: ['Module_Expert_Contributor', 'Special', 'Achievement', 'Skill', 'Community'],
    })
    badgeType: string;


    @Column({
        nullable: true,
        type: "varchar",
    })
    pictureUrl: string;

    @OneToMany(() => UserBadgesEntity, (userBadge) => userBadge.badge)
    userBadges: UserBadgesEntity[];
}
