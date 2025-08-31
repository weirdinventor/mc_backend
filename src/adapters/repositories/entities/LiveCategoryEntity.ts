import {Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {LiveEntity} from "./LiveEntity";
import {ResourceEntity} from "./ResourceEntity";
import {PostEntity} from "./PostEntity";


@Entity('live_category')
export class LiveCategoryEntity {
    @PrimaryColumn()
    id: string;


    @Column({
        type: "varchar",
        nullable: false,
    })
    name: string;

    @CreateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt?: Date;

    @UpdateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    updatedAt?: Date;

    @OneToMany(() => LiveEntity, live => live.category)
    lives: LiveEntity[];

    @OneToMany(() => ResourceEntity, resource => resource.category)
    resources: ResourceEntity[];

    @OneToMany(() => PostEntity, post => post.liveCategory)
    posts: PostEntity[];
}
