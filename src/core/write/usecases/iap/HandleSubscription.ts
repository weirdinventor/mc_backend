import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {SubscriptionDetails} from "../../domain/types/SubscriptionInformation";
import {Identifiers} from "../../../Identifiers";
import {SubscriptionRepository} from "../../domain/repositories/SubscriptionRepository";
import {SubscriptionProperties} from "../../domain/aggregates/Subscription";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {User} from "../../domain/aggregates/User";
import {IAPPurchaseGateway} from "../../domain/gateway/IAPPurchaseGateway";

export interface HandleSubscriptionInput {
    user: UserIdentity;
    subDetails:SubscriptionDetails;
}

@injectable()
export class HandleSubscription implements Usecase<HandleSubscriptionInput, User> {
    constructor(
        @inject(Identifiers.subscriptionRepository)
        private readonly _subscriptionRepository: SubscriptionRepository,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(Identifiers.iapPurchaseGateway)
        private readonly _iapPurchaseGateway: IAPPurchaseGateway,
    ) {
    }

    async execute(param: HandleSubscriptionInput): Promise<User> {

        await this._subscriptionRepository.updateSubscription({transactionId: param.subDetails.transactionId, platform: param.subDetails.platform}, param.subDetails)
        const sub = await this._subscriptionRepository.getByTransactionId(param.subDetails.transactionId, param.subDetails.platform)

        const user = await this._userRepository.getById(param.user.id)

        user.updateSubscriptionStatus(!sub.props.cancelled)

        await this._userRepository.save(user)

        await this._iapPurchaseGateway.acknowledgePurchase({
            os: param.subDetails.platform, packageName: param.subDetails.rawData.packageName, receipt: param.subDetails.transactionId, subscriptionId: param.subDetails.rawData.productId
        })

        return await this._userRepository.getById(param.user.id)
    }
}