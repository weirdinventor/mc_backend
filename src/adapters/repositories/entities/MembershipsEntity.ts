import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {GroupEntity} from "./GroupEntity";


@Entity("membership")
export class MembershipsEntity {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    groupId: string;

    @Column({
        type: "boolean",
        default: false
    })
    isAdmin: boolean;

    @ManyToOne(() => UserEntity, user => user.members)
    @JoinColumn({ name: "userId" })
    user: UserEntity;

    @ManyToOne(() => GroupEntity, group => group.members)
    @JoinColumn({ name: "groupId" })
    group: GroupEntity;
}