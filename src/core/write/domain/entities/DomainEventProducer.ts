import { DomainEvent } from './DomainEvent';

export interface DomainEventProducer<T = object> {
  clearEvents(): void;
  getEvents(): DomainEvent<T>[];
}
