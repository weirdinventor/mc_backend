import {DomainError} from "./DomainError";

export namespace ProfileErrors {
    export class ProfileNotFound extends DomainError {
        constructor() {
            super('PROFILE_NOT_FOUND')
        }
    }

    export class UsernameAlreadyUsed extends DomainError {
        constructor() {
            super('USERNAME_ALREADY_USED')
            this.httpCode = 400
        }
    }
}