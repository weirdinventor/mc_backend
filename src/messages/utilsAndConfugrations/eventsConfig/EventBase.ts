import { v4 } from 'uuid';
import { Event } from './Event';


export type PayloadOf<TProps> = Omit<EventBase<TProps>, 'id' | 'timestamp'>;

export abstract class EventBase<TProps> implements Event<TProps> {
  public readonly id: string;
  public readonly timestamp: number;
  public readonly props: TProps;

  protected constructor();
  protected constructor(data?: object) {
    this.id = v4();
    this.timestamp = Date.now();
    if (data) {
      for (const key in data) {
        if (key === 'id' || key === 'timestamp') {
          throw new Error(`Cannot override ${key} property`);
        }
        this[key] = data[key];
      }
    }
  }
}
