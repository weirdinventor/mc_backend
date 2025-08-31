import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryColumn
} from "typeorm";
import { AccessLevel } from "../../../core/write/domain/types/AccessLevel";
import { UserEntity } from "./UserEntity";

@Entity("grades")
export class GradeEntity {
    @PrimaryColumn("uuid")
    id: string;

    @Column({
        nullable: false,
        type: "varchar",
        unique: true,
    })
    name: string;

    @Index()
    @Column({
        nullable: false,
        type: "integer",
    })
    minXpRequired: number;

    @Column({
        nullable: false,
        type: "enum",
        enum: AccessLevel,
    })
    userTypeAccess: AccessLevel;

    @Column({
        nullable: true,
        type: "varchar",
    })
    animationAssetUrl: string;

    @OneToMany(() => UserEntity, (user) => user.currentGrade)
    users?: UserEntity[];

}
