import {DomainError} from "./DomainError";

export namespace StreamErrors {
    export class PremiumAccessDenied extends DomainError {
        constructor(message?: string) {
            super(message ?? 'PREMIUM_ACCESS_DENIED');
            this.httpCode = 400
        }
    }
}