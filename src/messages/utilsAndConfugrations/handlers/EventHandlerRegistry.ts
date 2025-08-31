import { AsyncOrSync } from 'ts-essentials';
import { EventHandlerCtor } from './EventHandlerCtor';
import { EventHandlerRegistration } from './EventHandlerRegistration';
import { Event } from '../eventsConfig/Event';
import { EventHandlerRegistrationOptions } from './EventHandlerRegistrationOptions';
import {EventCtor} from "../eventsConfig/EventCtor";

export abstract class EventHandlerRegistry {
  abstract register<TEvent extends Event>(
    event: EventCtor<TEvent>,
    handler: EventHandlerCtor<TEvent>,
    options?: EventHandlerRegistrationOptions,
  ): AsyncOrSync<void>;
  abstract read(): AsyncOrSync<EventHandlerRegistration<Event>[]>;
}
