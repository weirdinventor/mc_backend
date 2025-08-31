import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {GroupEntity} from "./GroupEntity";
import {LiveCategoryEntity} from "./LiveCategoryEntity";


@Entity("resource")
export class ResourceEntity {

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
        nullable: false,
        type: "varchar",
    })
    url: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    image: string;


    @ManyToOne(() => UserEntity, (user) => user.resources)
    @JoinColumn({name: "authorId"})
    author: UserEntity;

    @Column()
    authorId: string;

    @ManyToOne(() => GroupEntity, (group) => group.resources)
    @JoinColumn({name: "groupId"})
    group: GroupEntity;

    @Column()
    groupId: string;

    @ManyToOne(() => LiveCategoryEntity, (category) => category.resources)
    @JoinColumn({
        name: "categoryId"
    })
    category: LiveCategoryEntity;

    @Column({
        nullable: true
    })
    categoryId: string;


    @CreateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt: Date;

    @UpdateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    updatedAt: Date;
}