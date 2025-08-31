import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {RecordStatus} from "../../../core/write/domain/types/RecordStatus";

@Entity("record")
export class RecordEntity {
    @PrimaryColumn()
    id: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    title: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    description: string;

    @Column({
        type: "varchar",
        nullable: true,
    })
    thumbnail: string;

    @Column({
        type: "enum",
        enum: ["DRAFT", "PUBLISHED"],
        default: "DRAFT"
    })
    status: RecordStatus;

    @Column({
        type: "varchar",
        nullable: false
    })
    fileUrl: string;

    @CreateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    createdAt?: Date;

    @UpdateDateColumn({
        default: () => "CURRENT_TIMESTAMP",
    })
    updatedAt?: Date;
}