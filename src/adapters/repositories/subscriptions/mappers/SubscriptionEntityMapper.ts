import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {SubscriptionEntity} from "../../entities/SubscriptionEntity";
import {Subscription} from "../../../../core/write/domain/aggregates/Subscription";
import {EntityManager} from "typeorm";

export class SubscriptionEntityMapper implements Mapper<SubscriptionEntity, Subscription> {

    constructor(
        private readonly entityManager: EntityManager
    ) {
    }

    fromDomain(t: Subscription): SubscriptionEntity {
        return this.entityManager.create(SubscriptionEntity, t.props)
    }

    toDomain(raw: SubscriptionEntity): Subscription {
        return new Subscription({
            cancelled: raw.cancelled,
            disabled: raw.disabled,
            expireAt: raw.expireAt,
            id: raw.transactionId,
            platform: raw.platform,
            rawData: raw.rawData,
            sandbox: raw.sandbox,
            transactionId: raw.transactionId,
            userId: raw.userId
        })
    }
}