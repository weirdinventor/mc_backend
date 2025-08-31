import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";

export interface BadgeCreatedProperties {
  id: string;
  name: string;
  description?: string;
  badgeType: 'Module_Expert_Contributor' | 'Special' | 'Achievement' | 'Skill' | 'Community';
  pictureUrl?: string;
}

@DecoratedEvent({
  name: "BADGE_CREATED",
  version: 1,
  namespace: "moula-club",
})
export class BadgeCreated implements DomainEvent {
  id = v4();
  props: BadgeCreatedProperties;
  timestamp? = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: BadgeCreatedProperties) {
    this.props = props;
  }
}
