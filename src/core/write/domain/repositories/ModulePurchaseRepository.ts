import {ModulePurchase} from "../aggregates/ModulePurchase";

export interface ModulePurchaseRepository {
    create(modulePurchase: {
        userId: string;
        purchase: ModulePurchase
    }): Promise<void>;
}