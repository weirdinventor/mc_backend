import {EventHandlerRegistry} from "../handlers/EventHandlerRegistry";
import {EventCtor} from "./EventCtor";
import {EventHandlerRegistrationOptions} from "../handlers/EventHandlerRegistrationOptions";
import {Event} from "./Event";
import {EventHandlerCtor} from "../handlers/EventHandlerCtor";
import {EventHandlerRegistration} from "../handlers/EventHandlerRegistration";


export class InMemoryEventHandlerRegistry extends EventHandlerRegistry {
  protected _registrations: Map<EventCtor<Event>, EventHandlerRegistration<Event>[]>;

  constructor() {
    super();
    this._registrations = new Map<EventCtor<Event>, EventHandlerRegistration<Event>[]>();
  }

  public register<TEvent extends Event>(
    event: EventCtor<TEvent>,
    handler: EventHandlerCtor<TEvent>,
    options?: EventHandlerRegistrationOptions,
  ): void {
    const entry = this.ensureRegistration(event);
    entry.push({ event, handler, options });
  }

  private ensureRegistration(event: EventCtor<Event>) {
    let entry = this._registrations.get(event);

    if (!entry) {
      entry = [];
      this._registrations.set(event, entry);
    }
    return entry;
  }

  public read(): EventHandlerRegistration<Event>[] {
    return Array.from(this._registrations.values()).flat();
  }
}
