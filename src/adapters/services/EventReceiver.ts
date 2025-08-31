import { injectable } from 'inversify';
import {DomainEvent} from "../../core/write/domain/entities/DomainEvent";
import {EventHandler} from "../../messages/utilsAndConfugrations/handlers/EventHandler";

export interface SubscriptionInfo {
  channel: string;
  eventName: string;
  version: number;
}

@injectable()
export abstract class EventReceiver {
  abstract subscribe<T extends DomainEvent>(
    info: SubscriptionInfo,
    eventDomainHandler: EventHandler<T>,
  ): Promise<void>;
  abstract start(): Promise<void>;
}
