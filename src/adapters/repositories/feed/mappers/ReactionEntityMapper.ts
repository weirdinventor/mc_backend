import { inject } from "inversify";
import { Reaction } from "../../../../core/write/domain/aggregates/Reaction";
import {Mapper} from "../../../../core/write/domain/models/Mapper";
import { ReactionEntity } from "../../entities/ReactionEntity";
import { EntityManager } from "typeorm";

export class ReactionEntityMapper implements Mapper<ReactionEntity, Reaction>
{
    constructor(
        private readonly entityManager: EntityManager
    ) {
    }
    fromDomain(t: Reaction): ReactionEntity {
        console.log(t)
        return this.entityManager.create(ReactionEntity, {
            id: t.id,
            emoji: t.props.emoji,
            postId: t.props.postId,
            userId: t.props.userId
        })
    }
    toDomain(t: ReactionEntity): Reaction {
        return Reaction.restore({
            id: t.id,
            emoji: t.emoji,
            postId: t.postId,
            userId: t.userId
        })
    }
}