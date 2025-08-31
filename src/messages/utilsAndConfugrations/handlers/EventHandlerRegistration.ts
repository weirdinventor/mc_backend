import { EventHandlerCtor } from './EventHandlerCtor';
import { Event } from '../eventsConfig/Event';
import { EventCtor } from '../eventsConfig/EventCtor';
import { EventHandlerRegistrationOptions } from './EventHandlerRegistrationOptions';

export interface EventHandlerRegistration<TEvent extends Event> {
  event: EventCtor<TEvent>;
  handler: EventHandlerCtor<TEvent>;
  options?: EventHandlerRegistrationOptions;
}
