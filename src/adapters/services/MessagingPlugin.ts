import { EventDispatcher } from './EventDispatcher';
import { EventReceiver } from './EventReceiver';

export interface MessagingPlugin {
  dispatcher: EventDispatcher;
  receiver: EventReceiver;
}
