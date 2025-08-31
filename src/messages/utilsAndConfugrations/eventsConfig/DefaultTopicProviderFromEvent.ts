
import { injectable } from 'inversify';
import { assert } from 'ts-essentials';
import {EventCtor} from "./EventCtor";
import {EventMetadata} from "../metadata/EventMetadata";
import {TopicProviderFromEventInstance} from "./TopicProviderFromEventInstance";
import {TopicProviderFromEventCtor} from "./TopicProviderFromEventCtor";
import {Event} from "./Event";

@injectable()
export class DefaultTopicProviderFromEvent
  implements TopicProviderFromEventInstance, TopicProviderFromEventCtor
{
  getTopics<TEvent extends Event>(event: TEvent): string[];
  getTopics<TEvent extends Event>(event: EventCtor<TEvent>): string[];
  getTopics<TEvent extends Event>(event: TEvent | EventCtor<TEvent>): string[] {
    let metadata: EventMetadata<TEvent>;
    if (event instanceof Function) {
      metadata = EventMetadata.getFromCtor(event);
    } else {
      metadata = EventMetadata.getFromInstance(event);
    }

    assert(metadata.namespace);

    return [metadata.namespace];
  }
}
