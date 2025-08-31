import {Container} from "inversify";
import cron from "node-cron";
import {EntityManager} from "typeorm";
import {Identifiers} from "../../core/Identifiers";
import {IAPPurchaseGateway} from "../../core/write/domain/gateway/IAPPurchaseGateway";
import {Os} from "../../core/write/domain/types/Os";
import {UserRepository} from "../../core/write/domain/repositories/UserRepository";
import {UserEntity} from "../../adapters/repositories/entities/UserEntity";
import {SubscriptionRepository} from "../../core/write/domain/repositories/SubscriptionRepository";
import {User} from "../../core/write/domain/aggregates/User";
import {SubscriptionEntity} from "../../adapters/repositories/entities/SubscriptionEntity";

export async function fetchAndUpdateSubs(container: Container) {
    const entityManager = container.get<EntityManager>(Identifiers.entityManager);
    const iapPurchaseGateway = container.get<IAPPurchaseGateway>(Identifiers.iapPurchaseGateway);
    const subRepo = container.get<SubscriptionRepository>(Identifiers.subscriptionRepository);

    const subscriptions = await entityManager.query(`
        Select s."transactionId" as "transactionId",
               s."userId" as "userId",
               s.platform as platform,
               s."expireAt" as "expireAt",
               s.disabled as "disabled",
               s.cancelled as "cancelled",
               s.sandbox as "sandbox",
               s."rawData" as "rawData",
               u."isSubscribed" as "isSubscribed"
        from subscriptions s
                 inner join public.users u on u.id = s."userId" AND u."deletedAt"
        where u."isSubscribed" = true
    `)

    console.log(subscriptions)

    let unsubbedUsers: string[];

    for (const sub of subscriptions) {
        try {
            switch (sub.platform) {
                case Os.ANDROID:
                    const result = await iapPurchaseGateway.getInfos({
                        os: Os.ANDROID, packageName: sub.rawData.packageName, receipt: sub.transactionId, subscriptionId: sub.rawData.productId
                    }, '')

                    if (sub.isSubscribed && result.cancelled) {
                        unsubbedUsers.push(sub.userId as string)
                        await entityManager.createQueryBuilder()
                            .update(SubscriptionEntity)
                            .set({
                                cancelled: true,
                            })
                            .where('transactionId = :transactionId', { transactionId: sub.transactionId })
                            .execute()
                    }
                    break;
                case Os.IOS:
                    break;
                default:
                    console.warn('unknown subscription platform: ' + sub.platform);
                    break;
            }
        } catch(error) {
            console.error(error)
        }
    }

    await entityManager.createQueryBuilder()
        .update(UserEntity)
        .set({
            isSubscribed: false,
        })
        .where('id IN (:...ids)', {ids: unsubbedUsers})
        .execute()
}

export async function CheckSubscription(container: Container) {
    cron.schedule(process.env.SYNC_LIVE_RECORDING_60_MINUTES_SCHEDULE, async function () {
        await fetchAndUpdateSubs(container);
    })
}