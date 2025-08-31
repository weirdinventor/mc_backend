import { injectable } from 'inversify';
import {TopicProviderFromEventCtor} from "./TopicProviderFromEventCtor";
import {EventHandlerRegistration} from "../handlers/EventHandlerRegistration";
import {Event} from "./Event";

@injectable()
export class TopicProviderFromRegistration {
  private _topicProvider: TopicProviderFromEventCtor;

  constructor(topicProvider: TopicProviderFromEventCtor) {
    this._topicProvider = topicProvider;
  }

  getTopics<TEvent extends Event>(registration: EventHandlerRegistration<TEvent>): string[] {
    if (registration.options && registration.options.topic) {
      return [registration.options.topic];
    }

    return this._topicProvider.getTopics(registration.event);
  }
}
