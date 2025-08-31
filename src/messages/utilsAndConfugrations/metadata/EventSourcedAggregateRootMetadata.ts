import { Newable } from 'ts-essentials';

export class EventSourcedAggregateRootMetadata<T> {
  constructor(target: Newable<T>) {
    this.target = target;
    this.name = target.name;
    this.setDefaultValues();
  }
  private setDefaultValues() {
    this.handlers = new Map<string, any>();
  }
  public name: string;
  public target: Newable<T>;
  public handlers: Map<string, any>;
}
