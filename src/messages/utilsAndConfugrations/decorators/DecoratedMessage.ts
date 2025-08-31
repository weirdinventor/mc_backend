import {MessageMetadata} from "../metadata/MessageMetadata";
import {StaticMessageRegistry} from "../metadata/StaticMessageRegistry";

export type DecoratedMessageData = {
  name: string;
  version: number;
  namespace?: string;
};

export function DecoratedMessage(data: DecoratedMessageData) {
  return target => {
    const metadata = MessageMetadata.ensure(target);

    // set the global metadata
    metadata.name = data.name;
    metadata.version = data.version;
    metadata.namespace = data.namespace;

    if (!StaticMessageRegistry.has(data.namespace, data.name, data.version)) {
      StaticMessageRegistry.register(target);
    } else {
      console.warn('Multiple message with same metadata has been registered', metadata);
    }
  };
}
