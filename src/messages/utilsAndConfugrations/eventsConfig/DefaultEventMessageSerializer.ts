
import { injectable } from 'inversify';
import { EventJson } from './EventJson';
import {EventMetadata} from "../metadata/EventMetadata";
import {StaticEventRegistry} from "../metadata/StaticEventRegistry";
import {HandlerContext} from "../handlers/HandlerContext";
import {EventMessageSerializer} from "./EventMessageSerializer";
import {Event} from "./Event";

@injectable()
export class DefaultEventMessageSerializer extends EventMessageSerializer {
  serialize(event: Event, context?: HandlerContext): string {
    const metadata = EventMetadata.getFromInstance(event);

    const eventJson: EventJson = {
      id: event.id,
      name: metadata.name,
      timestamp: Date.now(),
      namespace: metadata.namespace,
      version: metadata.version,
      context: context,
      payload: {
        // todo make a better method to capture the custom event properties outside of props
        ...event,
      },
    };

    return JSON.stringify(eventJson);
  }

  public deserialize(event: string): Event {
    const eventJson: EventJson = JSON.parse(event);

    const eventMetadata = StaticEventRegistry.get(eventJson.namespace, eventJson.name, eventJson.version);
    if (!eventMetadata) {
      throw new Error(
        `Cannot deserialize ${eventJson.name}, because it not found in the ${StaticEventRegistry.name}`,
      );
    }

    const instance = new eventMetadata.target();

    // todo make a better method to capture the custom event properties outside of props
    // it is a side effect
    Object.assign(instance, eventJson.payload);

    return instance;
  }
}
