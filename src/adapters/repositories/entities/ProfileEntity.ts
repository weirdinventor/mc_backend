import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {UserRole} from "../../../core/write/domain/types/UserRole";
import {UserGender} from "../../../core/write/domain/types/UserGender";


@Entity('profiles')
export class ProfileEntity {

    @PrimaryColumn()
    id: string

    @Column({
        nullable: false,
        type: "varchar",
    })
    firstName: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    lastName: string;

    @Column({
        nullable: false,
        type: "varchar",
        unique: true,
    })
    username: string;


    @Column({
        nullable: true,
        type: "varchar",
    })
    profilePicture?: string;

    @Column({
        nullable: false,
        type: "varchar",
        default: UserGender.UNKNOWN,
    })
    gender: UserGender;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date
}


