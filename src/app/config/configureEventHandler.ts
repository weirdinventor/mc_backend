
import { Container } from 'inversify';
import { EventManager } from '../../messages/utilsAndConfugrations/eventsConfig/EventManager';

import {SymTopicProviderFromEventInstance} from "../../messages/utilsAndConfugrations/eventsConfig/TopicProviderFromEventInstance";
import {SymTopicProviderFromEventCtor} from "../../messages/utilsAndConfugrations/eventsConfig/TopicProviderFromEventCtor";
import {EventReceiver} from "../../adapters/services/EventReceiver";
import {EventHandlerRegistry} from "../../messages/utilsAndConfugrations/handlers/EventHandlerRegistry";
import {
  DefaultTopicProviderFromEvent
} from "../../messages/utilsAndConfugrations/eventsConfig/DefaultTopicProviderFromEvent";
import {
  TopicProviderFromRegistration
} from "../../messages/utilsAndConfugrations/eventsConfig/TopicProviderFromRegistration";
import {
  InMemoryEventHandlerRegistry
} from "../../messages/utilsAndConfugrations/eventsConfig/InMemoryEventHandlerRegistry";


export async function configureEventHandler(container: Container, registration: (em: EventManager) => void) {
  const receiver = container.get(EventReceiver);
  const topicProviderFromEvent = new DefaultTopicProviderFromEvent();
  const topicProvider = new TopicProviderFromRegistration(topicProviderFromEvent);
  const registry = new InMemoryEventHandlerRegistry();
  const eventManager = new EventManager(container, receiver, registry, topicProvider);

  container.bind(TopicProviderFromRegistration).toConstantValue(topicProvider);
  container.bind(DefaultTopicProviderFromEvent).toConstantValue(topicProviderFromEvent);
  container.bind(SymTopicProviderFromEventInstance).toConstantValue(topicProviderFromEvent);
  container.bind(SymTopicProviderFromEventCtor).toConstantValue(topicProviderFromEvent);

  container.bind(EventHandlerRegistry).toConstantValue(registry);
  container.bind(EventManager).toConstantValue(eventManager);

  registration(eventManager);

  await eventManager.start();
}
