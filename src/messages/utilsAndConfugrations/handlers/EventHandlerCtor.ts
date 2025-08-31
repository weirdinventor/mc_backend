import { Newable } from 'ts-essentials';
import { EventHandler } from './EventHandler';
import { Event } from '../eventsConfig/Event';

export type EventHandlerCtor<TEvent extends Event> = Newable<EventHandler<TEvent>>;
