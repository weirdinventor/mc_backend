
import { injectable } from "inversify";
import { appleProducts } from "./resources/appleProducts";
import { androidProducts } from "./resources/androidProducts";
import {Os} from "../../../core/write/domain/types/Os";
import {IapProduct} from "../../../core/write/domain/types/IapProduct";
import {IAPProductGateway} from "../../../core/write/domain/gateway/IAPProductGateway";
import {FinanceErrors} from "../../../core/write/domain/errors/FinanceErrors";


@injectable()
export class MoulaClubIAPProductGateway implements IAPProductGateway {


  async getByAmount(amount: number, filterOn: { productIds: string[]; os: Os }): Promise<IapProduct> {
    const availableProducts = filterOn.os === Os.IOS ? appleProducts : androidProducts;
    const availableProduct = availableProducts.find(elem => elem.amount === amount && !filterOn.productIds.includes(elem.id))

    if (!availableProduct) {
      throw new FinanceErrors.ProductNotFound();
    }

    return {
      amount: availableProduct.amount,
      id: availableProduct.id,
      provider: filterOn.os,
    }
  }
}
