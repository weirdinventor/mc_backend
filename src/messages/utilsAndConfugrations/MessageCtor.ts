import { Newable } from 'ts-essentials';
import {Message} from "./eventsConfig/Event";

export type MessageCtor<TMessage extends Message> = Newable<TMessage>;
