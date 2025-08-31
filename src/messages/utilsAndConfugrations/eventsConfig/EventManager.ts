

import { Container, injectable } from 'inversify';
import {EventReceiver} from "../../../adapters/services/EventReceiver";
import {EventCtor} from "./EventCtor";
import {EventHandlerRegistry} from "../handlers/EventHandlerRegistry";
import {TopicProviderFromRegistration} from "./TopicProviderFromRegistration";
import {EventHandlerCtor} from "../handlers/EventHandlerCtor";
import {EventHandlerRegistrationOptions} from "../handlers/EventHandlerRegistrationOptions";
import {EventHandlerRegistration} from "../handlers/EventHandlerRegistration";
import {EventMetadata} from "../metadata/EventMetadata";
import {EventErrors} from "../../../core/write/domain/models/EventErrors";
import {Event} from "./Event";

@injectable()
export class EventManager {
  private _receiver: EventReceiver;
  private _registry: EventHandlerRegistry;
  private _container: Container;
  private _topicProvider: TopicProviderFromRegistration;

  constructor(
    container: Container,
    receiver: EventReceiver,
    registry: EventHandlerRegistry,
    topicProvider: TopicProviderFromRegistration, // it used a specific implementation for legacy reason
  ) {
    this._container = container;
    this._receiver = receiver;
    this._registry = registry;
    this._topicProvider = topicProvider;
  }

  register<TEvent extends Event>(
    event: EventCtor<TEvent>,
    handler: EventHandlerCtor<TEvent>,
    options?: EventHandlerRegistrationOptions,
  ): this {
    this._registry.register(event, handler, options);
    return this;
  }

  async start(): Promise<void> {
    const registrations = await this._registry.read();
    for (const registration of registrations) {
      await this.doRegistration(registration);
    }
    this._receiver.start();
  }

  private async doRegistration(registration: EventHandlerRegistration<Event<any>>) {
    console.log('[EventManager] register handler: ', registration.handler);

    const metadata = EventMetadata.getFromCtor(registration.event);

    // todo it should be moved in another location
    if (!metadata) {
      throw new EventErrors.MissingEventAttributes(
        `[EventManager] Do not forget to set Event decorator in your event: ${registration.event.name}`,
      );
    }

    const eventName = metadata.name;
    const version = metadata.version;

    const handler = this._container.resolve(registration.handler);

    const [topic] = this._topicProvider.getTopics(registration);
    await this._receiver.subscribe(
      {
        channel: topic,
        eventName: eventName,
        version: version,
      },
      handler,
    );
  }
}
