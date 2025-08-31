import {ExtendedSymbol} from "./TopicProviderFromEventInstance";
import {EventCtor} from "./EventCtor";
import {Event} from "./Event";

export const SymTopicProviderFromEventCtor = ExtendedSymbol('TopicProviderFromEventCtor');

export interface TopicProviderFromEventCtor {
  getTopics<TEvent extends Event>(event: EventCtor<TEvent>): string[];
}
