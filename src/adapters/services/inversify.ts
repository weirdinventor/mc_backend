import { Container } from 'inversify';
import {EventDispatcher} from "./EventDispatcher";
import {EventReceiver} from "./EventReceiver";
import {MessagingPlugin} from "./MessagingPlugin";


export function buildDomainEventDependencies(container: Container) {
  return {
    usePlugin(messagingPlugin: MessagingPlugin) {
      container.bind(EventDispatcher).toConstantValue(messagingPlugin.dispatcher);
      container.bind(EventReceiver).toConstantValue(messagingPlugin.receiver);
    },
  };
}
