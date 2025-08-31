import {Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Unique} from "typeorm";
import {Os} from "../../../core/write/domain/types/Os";
import {UserEntity} from "./UserEntity";

@Entity('subscriptions')
@Unique(['transactionId', 'platform'])
export class SubscriptionEntity {
    @PrimaryColumn()
    transactionId: string;

    @OneToOne(() => UserEntity, (user) => user.subscription)
    @JoinColumn({ name: "userId" })
    user: UserEntity;

    @Column()
    userId: string;

    @Column({
        type: "enum",
        enum: Os
    })
    platform: Os;

    @Column()
    expireAt: Date;

    @Column({
        type: "boolean",
        default: false
    })
    disabled: boolean;
    @Column({
        type: "boolean",
        default: false
    })
    cancelled: boolean;

    @Column({
        type: "boolean",
        default: false
    })
    sandbox: boolean;

    @Column({
        type: "jsonb"
    })
    rawData: Record<string, any>;
    ///@\w+\s*\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*?\)/g
}