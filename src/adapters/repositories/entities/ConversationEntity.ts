import {
    CreateDateColumn,
    Entity, ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
    JoinColumn, Column
} from "typeorm";
import {UserEntity} from "./UserEntity";
import {Message} from "../../../core/write/domain/types/MessageType";


@Entity("conversation")
export class ConversationEntity {
    @PrimaryColumn()
    id: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    startedBy: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    participant: string;

    @Column({
        type: 'jsonb',
        nullable: true
    })
    latestMessage: Message;

    @Column({
        type: "boolean",
        default: false
    })
    isBlocked: boolean;


    @ManyToOne(() => UserEntity, user => user.starters)
    @JoinColumn({name: "startedBy"})
    starterUser: UserEntity;

    @ManyToOne(() => UserEntity, user => user.participants)
    @JoinColumn({name: "participant"})
    participantUser: UserEntity;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}