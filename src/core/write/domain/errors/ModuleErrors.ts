import {DomainError} from "./DomainError";

export namespace ModuleErrors {
    export class ModuleNotOwned extends DomainError {
        constructor(message?: string) {
            super(message ?? 'YOU_DO_NOT_OWN_THIS_MODULE');
            this.httpCode = 403
        }
    }

    export class MissingAccessLevel extends DomainError {
        constructor(message?: string) {
            super(message ?? 'YOU_NEED_TO_PROVIDE_ACCESS_LEVEL');
            this.httpCode = 422
        }
    }
}