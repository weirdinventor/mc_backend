import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Post} from "../../domain/aggregates/Post";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {Identifiers} from "../../../Identifiers";
import {FeedRepository} from "../../domain/repositories/FeedRepository";

type AddReactionPayload = {
    user: UserIdentity;
    postId: string;
    emoji: string;
}

@injectable()
export class AddReaction implements Usecase<AddReactionPayload, Post> {

    constructor(
        @inject(Identifiers.feedRepository)
        private readonly feedRepository: FeedRepository,
    ) {
    }
    async execute(request: AddReactionPayload): Promise<Post> {
        return await this.feedRepository.addReaction({
            postId: request.postId,
            emoji: request.emoji,
            userId: request.user.id,
        });
    }
    /*canExecute?(identity: UserIdentity, request?: AddReaction): Promise<boolean> {
        throw new Error("Method not implemented.");
    }*/
}