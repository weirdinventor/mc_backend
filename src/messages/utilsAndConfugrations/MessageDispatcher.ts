import {Message} from "./eventsConfig/Event";


export interface MessageDispatcher {
  dispatch<TMessage extends Message>(message: TMessage, partitionKey?: string): Promise<any>;
}
