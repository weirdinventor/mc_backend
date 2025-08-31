import { DomainEvent } from './DomainEvent';
import { DomainEventProducer } from './DomainEventProducer';
import { Entity } from './Entity';
import { eventSourceAggregateRootSym } from '../../../../messages/utilsAndConfugrations/symbols/eventSourceAggregateRootSym';
import { AggregateErrors } from '../models/AggregateErrors';

export abstract class AggregateRoot<T> extends Entity<T> implements DomainEventProducer<any> {
  props: T & { id: string };

  createdAt = new Date();
  updatedAt = new Date();

  constructor(props: T & { id: string }) {
    super(props.id);
    this.props = props;
  }

  events: DomainEvent<any>[] = [];
  version = 0;

  getName() {
    return this.constructor.name;
  }
  getEvents(): DomainEvent[] {
    return this.events;
  }
  clearEvents() {
    this.events = [];
  }

  loadFromHistory(domainEvents: DomainEvent[]) {
    domainEvents.forEach(e => this.applyChange(e, false));
    return this;
  }

  addDomainEvent<K>(domainEvent: DomainEvent<K>) {
    const event = Object.assign(domainEvent, {
      metadata: {
        aggregate: this.getName(),
        aggregateId: this.id,
      },
    });
    this.events = [...this.events, event];
  }

  protected applyChange<K>(domainEvent: DomainEvent<K>, isNew = true): void {
    this.applyChangeInternal(domainEvent);
    if (isNew) {
      this.addDomainEvent(domainEvent);
    }
    ++this.version;
  }

  private applyChangeInternal<K>(domainEvent: DomainEvent<K>): void {
    const meta = Reflect.getOwnMetadata(eventSourceAggregateRootSym, this.constructor);
    const handleKey = meta.handlers.get(domainEvent.constructor.name);
    if (!handleKey) {
      throw new AggregateErrors.MissingHandleDecorator(`Missing @Handle decorator for ${handleKey} event`);
    }
    this[handleKey](domainEvent);
  }
}
