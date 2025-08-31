import {SubscriptionInformation} from "../types/SubscriptionInformation";

export interface IAPPurchaseGateway {
    getInfos(metadata: SubscriptionInformation, productId: string): Promise<{ expireAt: Date; cancelled: boolean; sandbox: boolean; amount: number; }>

    acknowledgePurchase(metadata: SubscriptionInformation): Promise<void>
}