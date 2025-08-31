import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {IAPPurchaseGateway} from "../../domain/gateway/IAPPurchaseGateway";
import {Os} from "../../domain/types/Os";
import {SubscriptionDetails, SubscriptionInformation} from "../../domain/types/SubscriptionInformation";
import {BadRequestError} from "routing-controllers";
import {UserIdentity} from "../../domain/entities/UserIdentity";

export type ProcessReceiptInput = {
    os: Os;
    receiptData: string;
    subscriptionId: string;
    user: UserIdentity;
}

@injectable()
export class ProcessReceipt implements Usecase<ProcessReceiptInput, any> {
    constructor(
        @inject(Identifiers.iapPurchaseGateway)
        private readonly _iapPurchaseGateway: IAPPurchaseGateway,
    ) {
    }

    async execute(param: ProcessReceiptInput): Promise<SubscriptionDetails> {
        let metadata: SubscriptionInformation
        if (param.os === Os.ANDROID) {
            const receiptData = JSON.parse(param.receiptData)
            const {packageName, purchaseToken, productId} = receiptData

            const purchaseDetails = await this._iapPurchaseGateway.getInfos({
                os: param.os, packageName: packageName, receipt: purchaseToken, subscriptionId: productId
            }, '')

            return {
                platform: Os.ANDROID,
                rawData: receiptData,
                transactionId: purchaseToken,
                userId: param.user.id,
                ...purchaseDetails
            }
        } else {
            throw new BadRequestError('Unhandled OS')
        }

    }

    async canExecute?(param: any): Promise<boolean> {
        throw new Error("Method not implemented.");
    }


}