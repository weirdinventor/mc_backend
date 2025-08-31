import {
    Column,
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from "typeorm";
import { UserEntity } from "./UserEntity";
import { BadgeEntity } from "./BadgeEntity";

@Entity("user_badges")
@Unique(["userId", "badgeId"])
export class UserBadgesEntity {
    @PrimaryColumn({
        type: "uuid",
    })
    id: string;

    @ManyToOne(() => UserEntity, user => user.id)
    @JoinColumn({ name: "userId" })
    user: string;

    @Column({
        nullable: false,
        type: "uuid",
    })
    userId: string;


    @ManyToOne(() => BadgeEntity, badge => badge.id)
    @JoinColumn({ name: "badgeId" })
    badge: string;

    @Column({
        nullable: false,
        type: "uuid",
    })
    badgeId: string;


    @Column({
        nullable: false,
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    })
    earnedTimestamp: Date;
}
