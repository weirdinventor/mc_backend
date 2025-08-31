import {DomainError} from "./DomainError";

export namespace FeedErrors {
    export class CantCreatePost extends DomainError {
        constructor(message?:string) {
            super(message ?? 'CANNOT_CREATE_POST');
            this.httpCode = 400
        }
    }
    export class AlreadyReacted extends DomainError {
        constructor(message?:string) {
            super(message ?? 'ALREADY_REACTED_ON_POST');
            this.httpCode = 422
        }
    }
}