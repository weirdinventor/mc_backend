import { EntityManager } from 'typeorm';
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {RecipientEntity} from "../../entities/RecipientEntity";
import {Recipient} from "../../../../core/write/domain/aggregates/Recipient";



export class RecipientEntityMapper implements Mapper<RecipientEntity, Recipient> {
  constructor(private readonly entityManager: EntityManager) {}

  fromDomain(t: Recipient): RecipientEntity {
    return this.entityManager.create(RecipientEntity, {
      id: t.props.id,
      email : t.props.email,
      phone : t.props.phone,
    });
  }

  toDomain(raw: RecipientEntity): Recipient {
    const recipient = Recipient.restore({
      id: raw.id,
      email : raw.email,
      phone : raw.phone,
    });
    recipient.createdAt = raw.createdAt;
    recipient.updatedAt = raw.updatedAt;
    return recipient;
  }
}
