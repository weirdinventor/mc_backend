import { injectable } from 'inversify';
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";


@injectable()
export abstract class DomainEventHandler<T extends DomainEvent> {
  abstract handle(domainEvent: T): Promise<void>;
}
