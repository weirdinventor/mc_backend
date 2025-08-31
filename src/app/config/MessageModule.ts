import { Container } from 'inversify';
import Redis from 'ioredis';
import {MessagingPlugin} from "../../adapters/services/MessagingPlugin";
import {RedisEventDispatcher} from "../../adapters/plugins/redis/RedisEventDispatcher";
import {RedisEventReceiver} from "../../adapters/plugins/redis/RedisEventReceiver";
import {EventReceiver} from "../../adapters/services/EventReceiver";
import {EventDispatcher} from "../../adapters/services/EventDispatcher";
import {configureEventHandler} from "./configureEventHandler";
import {EventManager} from "../../messages/utilsAndConfugrations/eventsConfig/EventManager";


export enum EventProvider {
  REDIS = 'redis'
}


type RedisProvider = {
  name: EventProvider.REDIS;
  redis: Redis;
};


export type MessageModuleConfiguration = {
  provider: RedisProvider
};

export class MessageModule {
  messagingPlugin: MessagingPlugin;

  constructor(private readonly _container: Container) {}

  configure(config: MessageModuleConfiguration) {
    this.messagingPlugin = {
      dispatcher: new RedisEventDispatcher(config.provider.redis),
      receiver: new RedisEventReceiver(
          config.provider.redis.duplicate(),
      )
    }
    buildDomainEventDependencies(this._container).usePlugin(
        this.messagingPlugin
    );
    return this;
  }

  async register(cb: (em: EventManager) => void) {
    await configureEventHandler(this._container, cb);
  }

}

export function buildDomainEventDependencies(container: Container) {
  return {
    usePlugin(messagingPlugin: MessagingPlugin) {
      container.bind(EventDispatcher).toConstantValue(messagingPlugin.dispatcher);
      container.bind(EventReceiver).toConstantValue(messagingPlugin.receiver);
    },
  };
}

