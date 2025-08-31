import { DomainError } from './DomainError';

export namespace AggregateErrors {
  export class MissingHandleDecorator extends DomainError {}
}
