import {Os} from "./Os";

export type SubscriptionInformation = {
    os: Os;
    packageName: string;
    subscriptionId: string;
    receipt: string;
}

export type SubscriptionDetails = {
    transactionId: string;
    userId: string;
    platform: Os;
    expireAt: Date;
    disabled?: boolean;
    cancelled: boolean;
    sandbox: boolean;
    amount: number;
    rawData: Record<string, any>;
}