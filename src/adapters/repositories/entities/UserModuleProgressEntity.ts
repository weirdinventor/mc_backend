import {
    Column,
    Entity,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
    Unique
} from "typeorm";
import { UserEntity } from "./UserEntity";
import { GroupEntity } from "./GroupEntity";

@Entity("user_module_progress")
@Unique(["userId", "moduleId"])
export class UserModuleProgressEntity {
    @PrimaryColumn({
        type: "uuid",
    })
    id: string;

    @ManyToOne(() => UserEntity, user => user.id)
    @JoinColumn({ name: "userId" })
    userId: string;

    @ManyToOne(() => GroupEntity, group => group.id)
    @JoinColumn({ name: "moduleId" })
    moduleId: string;

    @Column({
        nullable: false,
        type: "enum",
        enum: ['NotStarted', 'InProgress', 'Completed'],
        default: 'NotStarted',
    })
    completionStatus: string;

    @Column({
        nullable: false,
        type: "integer",
        default: 0,
    })
    discussionMessageCount: number;
}
