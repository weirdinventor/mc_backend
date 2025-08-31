import {DomainError} from "./DomainError";


export namespace RecordErrors {
    export class RecordNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? 'RECORD_NOT_FOUND');
            this.httpCode = 404;
        }
    }
}