import {inject, injectable} from "inversify";
import {SubscriptionRepository} from "../../../core/write/domain/repositories/SubscriptionRepository";
import {Identifiers} from "../../../core/Identifiers";
import {EntityManager} from "typeorm";
import {Os} from "../../../core/write/domain/types/Os";
import {Subscription} from "../../../core/write/domain/aggregates/Subscription";
import {SubscriptionEntity} from "../entities/SubscriptionEntity";
import {SubscriptionDetails} from "../../../core/write/domain/types/SubscriptionInformation";
import {SubscriptionEntityMapper} from "./mappers/SubscriptionEntityMapper";

@injectable()
export class PostgresSubscriptionRepository implements SubscriptionRepository {

    private readonly mapper: SubscriptionEntityMapper;

    constructor(
        @inject(Identifiers.entityManager)
        private readonly entityManager: EntityManager,
    ) {
        this.mapper = new SubscriptionEntityMapper(this.entityManager);
    }

    async getByTransactionId(transactionId: string, platform: Os): Promise<Subscription> {
        const repo = await this.entityManager.getRepository(SubscriptionEntity)

        const subEntity = await repo.findOne({
            where: {
                transactionId,
                platform
            }
        })

        if (!subEntity) return null;
        return this.mapper.toDomain(subEntity)
    }

    async updateSubscription(param: {
        transactionId: string;
        platform: Os
    }, subDetails: SubscriptionDetails): Promise<void> {
        const repo = this.entityManager.getRepository(SubscriptionEntity)
        await repo.upsert(this.mapper.fromDomain(new Subscription({
            cancelled: subDetails.cancelled,
            disabled: subDetails.disabled,
            expireAt: subDetails.expireAt,
            id: subDetails.transactionId,
            platform: subDetails.platform,
            rawData: subDetails.rawData,
            sandbox: subDetails.sandbox,
            transactionId: subDetails.transactionId,
            userId: subDetails.userId
        })), {
            conflictPaths: ['transactionId', 'platform'],
        })
    }
}
