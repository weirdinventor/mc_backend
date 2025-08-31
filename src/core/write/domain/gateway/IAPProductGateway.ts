import {Os} from "../types/Os";
import {IapProduct} from "../types/IapProduct";

export interface IAPProductGateway {
    getByAmount(amount: number, filterOn: { productIds: string[]; os: Os }): Promise<IapProduct>
}