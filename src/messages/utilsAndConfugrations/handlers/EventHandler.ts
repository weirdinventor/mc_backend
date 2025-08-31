import { AsyncOrSync } from 'ts-essentials';
import { Event } from '../eventsConfig/Event';

export interface EventReceiveContext {}

export interface EventHandler<TEvent extends Event> {
  handle: (event: TEvent, ctx: EventReceiveContext) => AsyncOrSync<void>;
}
