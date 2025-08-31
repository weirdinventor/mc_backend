import {DomainError} from "./DomainError";

export namespace GroupErrors {
    export class GroupNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? 'GROUP_NOT_FOUND');
            this.httpCode = 400
        }
    }

    export class GroupAlreadyExists extends DomainError {
        constructor(message?: string) {
            super(message ?? 'GROUP_ALREADY_EXISTS');
            this.httpCode = 400
        }
    }

    export class GroupMemberAlreadyExists extends DomainError {
        constructor(message?: string) {
            super(message ?? 'GROUP_MEMBER_ALREADY_EXISTS');
            this.httpCode = 400
        }
    }

    export class GroupMemberNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? 'GROUP_MEMBER_NOT_FOUND');
            this.httpCode = 400
        }
    }

    export class UserIsOwner extends DomainError {
        constructor(message?: string) {
            super(message ?? 'USER_IS_OWNER');
            this.httpCode = 400
        }
    }

    export class AlreadyPurchased extends DomainError {
        constructor(message?: string) {
            super(message ?? 'ALREADY_PURCHASED');
            this.httpCode = 400
        }
    }
}