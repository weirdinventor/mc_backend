import {DomainError} from "./DomainError";

export namespace LiveCategoryErrors {
    export class LiveCategoryNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? 'LIVE_CATEGORY_NOT_FOUND');
            this.httpCode = 400
        }
    }
}