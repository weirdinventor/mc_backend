import { DomainError } from './DomainError';

export namespace EventErrors {
  export class EventBusUrlEmpty extends DomainError {}
  export class NoHandlerFound extends DomainError {}
  export class EventHandlerAlreadyExist extends DomainError {}
  export class EventHandlerSubscriptionError extends DomainError {}
  export class MissingEventAttributes extends DomainError {}
  export class DomainEventsMapEmpty extends DomainError {}
}
