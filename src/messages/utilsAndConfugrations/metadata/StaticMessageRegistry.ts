import { MessageMetadata } from './MessageMetadata';
import {Message} from "../eventsConfig/Event";
import {MessageCtor} from "../MessageCtor";

// it's not the best solution,
// we need a not static MessageRegistry,
// but to have a graceful migration we need that
export class StaticMessageRegistry {
  static registry: Map<string, MessageMetadata> = new Map<string, MessageMetadata>();

  static register<TMessage extends Message>(event: MessageCtor<TMessage>) {
    const metadata = MessageMetadata.getFromCtor(event);

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
