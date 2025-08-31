import { DomainError } from "./DomainError";

export namespace DeviceErrors{
    export class InvalidDeviceToken extends DomainError{
        constructor() {
            super('INVALID_DEVICE_TOKEN')
        }
    }

    export class DeviceNotFound extends DomainError{
        constructor() {
            super('DEVICE_NOT_FOUND')
        }
    }
}