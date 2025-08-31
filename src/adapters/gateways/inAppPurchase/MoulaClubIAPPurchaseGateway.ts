import {injectable} from "inversify";
import {androidpublisher_v3} from "googleapis";
import {AppStoreClient} from "./apple/AppStoreClient";
import {IAPPurchaseGateway} from "../../../core/write/domain/gateway/IAPPurchaseGateway";
import {Os} from "../../../core/write/domain/types/Os";
import {SubscriptionInformation} from "../../../core/write/domain/types/SubscriptionInformation";

export interface IAPPurchaseGatewayConfig {
    // apple: AppStoreClient;
    google: androidpublisher_v3.Androidpublisher;

}

@injectable()
export class MoulaClubIAPPurchaseGateway implements IAPPurchaseGateway {

    constructor(
        private readonly config: IAPPurchaseGatewayConfig
    ) {
    }

    async getInfos(metadata: SubscriptionInformation, productId: string): Promise<{
        expireAt: Date;
        cancelled: boolean;
        sandbox: boolean;
        amount: number;
    }> {
        if (metadata.os === Os.ANDROID) {
            const result = await this.android(metadata)
            return {
                cancelled: +new Date() > +result.expiryDate,
                expireAt: result.expiryDate,
                sandbox: result.sandbox,
                amount: result.amount
            }
        }
        /*const result = await this.ios(metadata.receipt, productId)
        return {
          cancelled: +new Date() > +result.expiryDate,
          expireAt: result.expiryDate,
          sandbox: result.sandbox,
          amount: result.amount,
        }*/
    }

    /*async ios(receipt: string, productId: string): Promise<{ expiryDate: Date; sandbox: boolean; amount: number; }> {
      const result = await this.config.apple.getTransactionHistory(receipt, productId);
      return {
        expiryDate: new Date(result.transactions[0].expiresDate),
        sandbox: result.sandbox,
        amount: result.transactions[0].price / 1000
      }
    }*/

    async android(infos: {
        packageName: string;
        subscriptionId: string;
        receipt: string;
    }): Promise<{ expiryDate: Date; sandbox: boolean; amount: number; }> {
        return new Promise((resolve, reject) => {
            this.config.google.purchases.subscriptions.get({
                packageName: infos.packageName,
                subscriptionId: infos.subscriptionId,
                token: infos.receipt,
            }, (err, response) => {
                if (err) {
                    return reject(err);
                }
                return resolve({
                    expiryDate: new Date(+response.data.expiryTimeMillis),
                    sandbox: response.data.purchaseType === 0,
                    amount: response.data.paymentState === 1 ? +response.data.priceAmountMicros / 1000000 : 0
                });
            })
        })
    }

    async acknowledgePurchase(metadata: SubscriptionInformation): Promise<void> {
        await this.config.google.purchases.subscriptions.acknowledge({
            packageName: metadata.packageName,
            token: metadata.receipt,
            subscriptionId: metadata.subscriptionId,
        })
    }
}
