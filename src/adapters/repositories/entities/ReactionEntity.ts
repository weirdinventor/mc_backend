import {Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import { PostEntity } from "./PostEntity";
import {UserEntity} from "./UserEntity";

@Entity('reactions')
@Index(["userId", "postId"], { unique: true })
export class ReactionEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    emoji: string;

    @ManyToOne(() => PostEntity, (post) => post.reactions )
    @JoinColumn({ name: 'postId'})
    post: PostEntity;

    @Column()
    postId: string;

    @ManyToOne(() => UserEntity, (user) => user.reactions)
    @JoinColumn({ name: 'userId'})
    user: UserEntity;

    @Column()
    userId: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}