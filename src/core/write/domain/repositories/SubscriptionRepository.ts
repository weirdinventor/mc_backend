import {Subscription} from "../aggregates/Subscription";
import {Os} from "../types/Os";
import {SubscriptionDetails} from "../types/SubscriptionInformation";

export interface SubscriptionRepository {
    getByTransactionId(transactionId: string, platform: Os): Promise<Subscription>;
    updateSubscription(param: { transactionId: string; platform: Os }, subDetails: Partial<SubscriptionDetails>): Promise<void>;
}
