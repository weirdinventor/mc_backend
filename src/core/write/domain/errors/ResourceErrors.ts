import {DomainError} from "./DomainError";


export namespace ResourceErrors {

    export class ResourceNotFound extends DomainError {
        constructor(message?: string) {
            super(message ?? "RESOURCE_NOT_FOUND");
            this.httpCode = 400;
        }
    }
    
    export class ResourceNotFoundInGroup extends DomainError {
        constructor(message?: string) {
            super(message ?? "RESOURCE_NOT_FOUND_IN_GROUP");
            this.httpCode = 400;
        }
    }
}