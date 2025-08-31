import { v4 } from 'uuid';
import { Redis } from 'ioredis';
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {DomainEventProducer} from "../../../core/write/domain/entities/DomainEventProducer";
import {EventDispatcher} from "../../services/EventDispatcher";
import {EventErrors} from "../../../core/write/domain/models/EventErrors";
import {EventMetadata} from "../../../messages/utilsAndConfugrations/metadata/EventMetadata";

export class RedisEventDispatcher implements EventDispatcher {
  constructor(private readonly _redis: Redis) {}

  async dispatch(domainEventProducer: DomainEventProducer, partitionKey?: string): Promise<void> {
    const partitionKeyId = partitionKey || v4();
    const events = domainEventProducer.getEvents();
    if (!events.length) {
      throw new EventErrors.DomainEventsMapEmpty('Please provide core event before dispatch');
    }
    for (const domainEvent of events) {
      await this.publish(domainEvent, partitionKeyId);
    }
    return domainEventProducer.clearEvents();
  }

  async dispatchEvent(event: DomainEvent, partitionKey?: string): Promise<void> {
    const partitionKeyId = partitionKey || v4();
    await this.publish(event, partitionKeyId);
    return;
  }

  private async publish(domainEvent: DomainEvent, partitionKeyId?: string) {
    const metadata = EventMetadata.getFromInstance(domainEvent);
    const eventName = metadata.name;
    const timestamp = Date.now();
    const message = JSON.stringify({
      body: {
        props: {
          ...domainEvent.props,
        },
        metadata: {
          ...domainEvent.metadata,
          sentAt: new Date(timestamp),
          id: domainEvent.id,
          timestamp,
        },
      },
      label: eventName,
      messageId: partitionKeyId,
    });
    console.debug(`[RedisEventDispatcher] dispatch event ${eventName}`, message);
    return this._redis.publish(eventName, message);
  }
}
