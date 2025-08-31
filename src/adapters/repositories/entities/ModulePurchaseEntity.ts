import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {UserEntity} from "./UserEntity";
import {GroupEntity} from "./GroupEntity";


@Entity("module_purchase")
export class ModulePurchaseEntity {

    @PrimaryColumn()
    id: string

    @ManyToOne(() => UserEntity, user => user.modulePurchase)
    @JoinColumn({name: "userId"})
    user: UserEntity;

    @Column()
    userId: string;

    @ManyToOne(() => GroupEntity, group => group.modulePurchase)
    @JoinColumn({name: "moduleId"})
    module: GroupEntity;

    @Column()
    moduleId: string;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}