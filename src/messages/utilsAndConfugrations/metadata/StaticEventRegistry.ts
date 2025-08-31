import { EventMetadata } from './EventMetadata';
import {EventCtor} from "../eventsConfig/EventCtor";
import {Event} from "../eventsConfig/Event"


// it's not the best solution,
// we need a not static EventRegistry,
// but to have a graceful migration we need that
export class StaticEventRegistry {
  static registry: Map<string, EventMetadata> = new Map<string, EventMetadata>();

  static register<TEvent extends Event>(event: EventCtor<TEvent>) {
    const metadata = EventMetadata.getFromCtor(event);

    const key = this.computeKey(metadata.namespace, metadata.name, metadata.version);
    this.registry.set(key, metadata);
  }

  static get(namespace: string, name: string, version: number) {
    const key = this.computeKey(namespace, name, version);
    return this.registry.get(key);
  }

  static has(namespace: string, name: string, version: number) {
    const key = this.computeKey(namespace, name, version);
    return this.registry.has(key);
  }

  private static computeKey(namespace: string, name: string, version: number) {
    return `${namespace}->${name}->v${version}`;
  }
}
