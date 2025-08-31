import { DomainEventMetadata } from '../../../../messages/utilsAndConfugrations/metadata/DomainEventMetadata';
import { Event } from '../../../../messages/utilsAndConfugrations/eventsConfig/Event';

export interface DomainEvent<TProps = any> extends Event<TProps> {
  metadata?: DomainEventMetadata;
}
