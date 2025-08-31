import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {Os} from "../../../core/write/domain/types/Os";

@Entity('devices')
export class DeviceEntity {
    @PrimaryColumn()
    id: string


    @Column({
        nullable: false,
        type: "varchar",
    })
    registrationToken: string;

    @Column({
        nullable: false,
        type: "varchar",
    })
    uniqueId: string;


    @Column({
        nullable: false,
        enum: Os,
        default : Os.IOS
    })
    os: Os;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date

}
