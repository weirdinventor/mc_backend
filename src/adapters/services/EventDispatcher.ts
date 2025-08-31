import { injectable } from 'inversify';
import {DomainEventProducer} from "../../core/write/domain/entities/DomainEventProducer";
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";

@injectable()
export abstract class EventDispatcher {
  abstract dispatch(entity: DomainEventProducer<any>, partitionKey?: string): Promise<void>;
  abstract dispatchEvent(event: DomainEvent<any>, partitionKey?: string): Promise<void>;
}
