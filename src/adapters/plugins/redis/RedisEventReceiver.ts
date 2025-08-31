import {Redis} from 'ioredis';
import {EventReceiver, SubscriptionInfo} from "../../services/EventReceiver";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";
import {EventErrors} from "../../../core/write/domain/models/EventErrors";
import {DomainEventHandler} from "../../services/DomainEventHandler";

export class RedisEventReceiver implements EventReceiver {
  private _domainEventMap: Map<string, DomainEventHandler<any>[]>;

  constructor(private readonly _redis: Redis) {
    this._domainEventMap = new Map();
  }

  async subscribe<T extends DomainEvent>(
      info: SubscriptionInfo,
      domainEventHandler: DomainEventHandler<T>,
  ): Promise<void> {
    const eventName = info.eventName;
    const version = info.version;
    const eventHandlers = [];
    eventHandlers.push(domainEventHandler);
    const handlers = this._domainEventMap.get(eventName);
    if (handlers) {
      for (const handler of handlers) {
        eventHandlers.push(handler);
      }
    }
    this._domainEventMap.set(eventName, [...new Set(eventHandlers)]);
    if (!eventName || !version) {
      throw new EventErrors.MissingEventAttributes('Do not forget to set Event decorator in your event');
    }
  }

  async start() {
    if (this._domainEventMap.size > 0) {
      // Single 'message' event listener setup
      this._redis.on('message', async (channel, message) => {
        console.debug(`[RedisEventReceiver] Received message on channel ${channel}`);
        const handledMessage = JSON.parse(message);
        const eventMessage = handledMessage.body;
        const handlers = this._domainEventMap.get(channel);

        if (handlers) {
          for (const handler of handlers) {
            try {
              console.debug(`[RedisEventReceiver] Handling event ${channel} with ${handler.constructor.name}`);
              await handler.handle({
                id: eventMessage.metadata['id'],
                props: eventMessage.props,
                metadata: eventMessage.metadata,
                timestamp: eventMessage.metadata['timestamp'],
                sentAt: new Date(eventMessage.metadata['timestamp']),
              });
              console.debug(`[RedisEventReceiver] Event ${channel} successfully handled by ${handler.constructor.name}`);
            } catch (e) {
              console.error(`[RedisEventReceiver] Error occurred in handler ${handler.constructor.name} while handling event ${channel}`, e);
            }
          }
        }
      });

      // Subscription loop
      for (const key of this._domainEventMap.keys()) {
        await this._redis.subscribe(key, (err, count) => {
          if (err) {
            console.error(`[RedisEventReceiver] Error subscribing to channel ${key}`, err);
            throw err;
          }
          console.debug(`[RedisEventReceiver] Subscribed to ${count} event(s) on channel ${key}`);
        });
      }
    }
  }
}
