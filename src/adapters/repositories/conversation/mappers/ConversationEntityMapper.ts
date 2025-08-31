import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {ConversationEntity} from "../../entities/ConversationEntity";
import {Conversation} from "../../../../core/write/domain/aggregates/Conversation";
import {EntityManager} from "typeorm";


export class ConversationEntityMapper implements Mapper<ConversationEntity, Conversation> {
    constructor(
        private readonly entityManager: EntityManager
    ) {
    }

    fromDomain(t: Conversation): ConversationEntity {
        return this.entityManager.create(ConversationEntity, {
            id: t.id,
            startedBy: t.props.startedBy,
            participant: t.props.participant,
            isBlocked: t.props.isBlocked,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        });
    }

    toDomain(raw: ConversationEntity): Conversation {
        return Conversation.restore({
            id: raw.id,
            startedBy: raw.startedBy,
            participant: raw.participant,
            isBlocked: raw.isBlocked,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }
}