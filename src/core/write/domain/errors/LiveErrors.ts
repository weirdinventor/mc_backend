import {DomainError} from "./DomainError";

export namespace LiveErrors {
    export class LiveNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? 'LIVE_NOT_FOUND');
            this.httpCode = 400
        }
    }

    export class LiveNotScheduled extends DomainError {
        constructor(message?: string) {
            super(message ?? 'LIVE_NOT_SCHEDULED');
            this.httpCode = 400
        }
    }

    export class LiveNotOngoing extends DomainError {
        constructor(message?: string) {
            super(message ?? 'LIVE_NOT_ONGOING');
            this.httpCode = 400
        }
    }

    export class LiveAlreadyOngoing extends DomainError {
        constructor(message?: string) {
            super(message ?? 'LIVE_ALREADY_ONGOING');
            this.httpCode = 400
        }
    }

    export class UserIsOwner extends DomainError {
        constructor(message?: string) {
            super(message ?? 'USER_IS_OWNER');
            this.httpCode = 400
        }
    }
}