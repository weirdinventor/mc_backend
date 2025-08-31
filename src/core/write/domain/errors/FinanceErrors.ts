import {DomainError} from "./DomainError";

export namespace FinanceErrors {
    export class ProductNotFound extends DomainError {
        constructor(message?:string) {
            super(message ?? 'PRODUCT_NOT_FOUND');
            this.httpCode = 400
        }
    }
}