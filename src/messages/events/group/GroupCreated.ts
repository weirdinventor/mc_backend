import { v4 } from "uuid";
import { DomainEvent } from "../../../core/write/domain/entities/DomainEvent";
import { GroupPermission } from "../../../core/write/domain/types/GroupPermissions";
import { DecoratedEvent } from "../../utilsAndConfugrations/decorators/DecoratedEvent";
import { DomainEventMetadata } from "../../utilsAndConfugrations/metadata/DomainEventMetadata";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";

export interface GroupCreatedProperties {
  id: string;
  coverImage?: string;
  thumbnail?: string;
  name: string;
  subject: string;
  permissions: GroupPermission[];
  ownerId: string;
  accessLevel: AccessLevel;
  isModule: boolean;
}

@DecoratedEvent({
  name: "GROUP_CREATED",
  version: 1,
  namespace: "moula-club",
})
export class GroupCreated implements DomainEvent {
  id = v4();
  props: GroupCreatedProperties;
  timestamp? = +new Date();
  metadata: DomainEventMetadata;

  constructor(props: GroupCreatedProperties) {
    this.props = props;
  }
}
