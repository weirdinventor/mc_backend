import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {FeedRepository} from "../../domain/repositories/FeedRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {Post} from "../../domain/aggregates/Post";


@injectable()
export class DeletePost implements Usecase<{ id: string; authorId: string }, void> {

    constructor(
        @inject(Identifiers.feedRepository)
        private readonly _feedRepository: FeedRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: { id: string; authorId: string }): Promise<void> {
        const post = await this._feedRepository.getPostById(payload.id);
        post.deletePost({
            id: payload.id,
            authorId: payload.authorId
        })
        await this._feedRepository.deletePost(payload.id);
        await this._eventDispatcher.dispatch(post);
    }

}