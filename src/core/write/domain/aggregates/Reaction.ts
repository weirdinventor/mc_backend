import {AggregateRoot} from "../entities/AggregateRoot";
import {PostProperties} from "./Post";
import {UserProperties} from "./User";
import {v4} from "uuid";
import {ReactionCreated} from "../../../../messages/events/feed/ReactionCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";

export interface ReactionProperties {
    id: string;
    emoji: string;
    postId: string;
    userId: string;
    post?: PostProperties;
    user?: UserProperties;
}

export class Reaction extends AggregateRoot<ReactionProperties> {

    static restore(props: ReactionProperties) {
        return new Reaction(props);
    }

    static createReaction(payload: {
        emoji: string;
        userId: string;
        postId: string;
    }): Reaction {
        const {emoji, userId, postId} = payload;
        const reaction = new Reaction({
            id: v4(),
            emoji,
            userId,
            postId
        })
        reaction.applyChange(
            new ReactionCreated({
                postId: reaction.props.postId,
                userId: reaction.props.userId,
                emoji: reaction.props.emoji
            })
        )
        return reaction
    }

    @Handle(ReactionCreated)
    private applyReactionCreated(event: ReactionCreated) {
        this.props.emoji = event.props.emoji;
        this.props.postId = event.props.postId;
        this.props.userId = event.props.userId;
    }

    static updateReaction(payload: { id: string; emoji: string; userId: string; postId: string; }) {
        const {emoji, id, postId, userId} = payload;
        // TODO Event stuff later
        return new Reaction({
            id,
            emoji,
            userId,
            postId
        });
    }


}