import {Os} from "../types/Os";
import {User} from "./User";
import {AggregateRoot} from "../entities/AggregateRoot";

export interface SubscriptionProperties {
    transactionId: string;
    user?: User;
    userId: string;
    platform: Os;
    expireAt: Date;
    disabled: boolean;
    cancelled: boolean;
    sandbox: boolean;
    rawData: Record<string, any>;
}

export class Subscription extends AggregateRoot<SubscriptionProperties> {

}