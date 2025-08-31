import {DomainError} from "./DomainError";


export namespace UserGroupRoleErrors {
    export class RoleAlreadyAssigned extends DomainError {
        constructor() {
            super("ROLE_ALREADY_ASSIGNED");
            this.httpCode = 400;
        }
    }
}