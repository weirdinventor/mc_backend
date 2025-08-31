import { Newable } from 'ts-essentials';
import { Event } from "./Event";
import {DomainEvent} from "../../../core/write/domain/entities/DomainEvent";

export type EventCtor<TEvent extends Event> = Newable<TEvent>;
