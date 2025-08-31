import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany
} from "typeorm";
import {PostMediaType} from "../../../core/write/domain/types/PostMediaType";
import {UserEntity} from "./UserEntity";
import {ReactionEntity} from "./ReactionEntity";
import {LiveCategoryEntity} from "./LiveCategoryEntity";


@Entity('posts')
export class PostEntity {

    @PrimaryColumn()
    id: string

    @Column({
        nullable: true,
        type: "varchar"
    })
    text: string

    @Column({
        nullable: true,
        type: "varchar"
    })
    mediaUrl?: string

    @Column({
        nullable: false,
        type: "varchar",
        enum: PostMediaType,
        default: PostMediaType.TEXT
    })
    mediaType: PostMediaType

    @Column({
        nullable: true,
        type: "varchar"
    })
    thumbnail?: string

    @ManyToOne(() => UserEntity, (user) => user.posts)
    @JoinColumn({name: "authorId"})
    author: UserEntity;

    @Column()
    authorId: string;

    @OneToMany(() => ReactionEntity, (reaction) => reaction.post)
    reactions: ReactionEntity[];

    @ManyToOne(() => LiveCategoryEntity, (category) => category.id, { nullable: true })
    @JoinColumn({ name: "liveCategoryId" })
    liveCategory: LiveCategoryEntity;

    @Column({ nullable: true })
    liveCategoryId: string;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date
}
