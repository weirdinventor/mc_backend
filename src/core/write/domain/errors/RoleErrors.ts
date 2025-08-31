import {DomainError} from "./DomainError";

export namespace RoleErrors {
    export class RoleNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? 'ROLE_NOT_FOUND');
            this.httpCode = 400
        }
    }
}