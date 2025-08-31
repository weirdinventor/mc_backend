import {DomainError} from "./DomainError";

export namespace UserErrors {
    export class PasswordInvalid extends DomainError {
        constructor() {
            super("PASSWORD_INVALID");
            this.httpCode = 400;
        }
    }

    export class PhoneNumberAlreadyUsed extends DomainError {
        constructor() {
            super("PHONE_NUMBER_ALREADY_USED");
            this.httpCode = 400;
        }
    }

    export class EmailAlreadyUsed extends DomainError {
        constructor() {
            super("EMAIL_ALREADY_USED");
            this.httpCode = 400;
        }
    }

    export class PhoneNumberNotVerified extends DomainError {
        constructor() {
            super("PHONE_NUMBER_NOT_VERIFIED");
            this.httpCode = 400;
        }
    }

    export class PhoneNumberDoesNotExist extends DomainError {
        constructor() {
            super("PHONE_NUMBER_DOES_NOT_EXIST");
            this.httpCode = 400;
        }
    }

    export class UserNotFound extends DomainError {
        constructor() {
            super("USER_NOT_FOUND");
            this.httpCode = 404;
        }
    }

    export class UserNotActive extends DomainError {
        constructor() {
            super("USER_NOT_ACTIVE");
            this.httpCode = 400;
        }
    }

    export class InvalidEmailFormat extends DomainError {
        constructor() {
            super("INVALID_EMAIL_FORMAT");
            this.httpCode = 400;
        }
    }

    export class AuthenticationFailed extends DomainError {
        constructor() {
            super("AUTHENTICATION_FAILED");
            this.httpCode = 400;
        }
    }

    export class AccountNotValidated extends DomainError {
        constructor() {
            super("ACCOUNT_NOT_VALIDATED");
            this.httpCode = 400;
        }
    }

    export class PasswordNotMatch extends DomainError {
        constructor() {
            super("PASSWORD_NOT_MATCH");
            this.httpCode = 400;
        }
    }

    export class InvalidRecoveryCode extends DomainError {
        constructor() {
            super("INVALID_RECOVERY_CODE");
            this.httpCode = 400;
        }
    }

    export class PasswordSameAsPrevious extends DomainError {
        constructor() {
            super("PASSWORD_SAME_AS_PREVIOUS");
            this.httpCode = 400;
        }
    }

    export class PermissionDenied extends DomainError {
        constructor(message?: string) {
            super(message ?? "PERMISSION_DENIED");
            this.httpCode = 403;
        }
    }

    export class UserNotSubscribed extends DomainError {
        constructor() {
            super("USER_NOT_SUBSCRIBED");
            this.httpCode = 403;
        }
    }

    export class UserAlreadyBlocked extends DomainError {
        constructor() {
            super("USER_ALREADY_BLOCKED");
            this.httpCode = 400;
        }
    }

    export class ThisAccountIsDeleted extends DomainError {
        constructor() {
            super("THIS_ACCOUNT_IS_DELETED");
            this.httpCode = 403;
        }
    }
}
