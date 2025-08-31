import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {FeedErrors} from "../../domain/errors/FeedErrors";
import {Post} from "../../domain/aggregates/Post";
import {Identifiers} from "../../../Identifiers";
import {FeedRepository} from "../../domain/repositories/FeedRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {PostMediaType} from "../../domain/types/PostMediaType";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {StorageGateway} from "../../domain/gateway/StorageGateway";

export type CreatePostInput = {
    user: UserIdentity;
    post: {
        text: string
        mediaUrl?: string
        mediaType: PostMediaType
        thumbnail?: string
        liveCategoryId?: string
    }
}

@injectable()
export class CreatePost implements Usecase<CreatePostInput, Post> {
    constructor(
        @inject(Identifiers.feedRepository)
        private readonly _postRepository: FeedRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
    ) {
    }

    async execute(param: CreatePostInput): Promise<Post> {

        if (param.post.mediaType === PostMediaType.IMAGE && !param.post.mediaUrl) {
            throw new FeedErrors.CantCreatePost('MEDIA_URL_REQUIRED_FOR_IMAGE_POSTS');
        }

        if (param.post.mediaType === PostMediaType.IMAGE && param.post.thumbnail) {
            throw new FeedErrors.CantCreatePost('IMAGE_POSTS_DONT_NEED_THUMBNAIL');
        }

        if (param.post.mediaType === PostMediaType.VIDEO && !param.post.mediaUrl) {
            throw new FeedErrors.CantCreatePost('MEDIA_URL_REQUIRED_FOR_VIDEO_POSTS');
        }

        if (param.post.mediaType === PostMediaType.VIDEO && !param.post.thumbnail) {
            throw new FeedErrors.CantCreatePost('THUMBNAIL_REQUIRED_FOR_VIDEO_POSTS');
        }

        // create the feed
        const post = Post.createPost({
            text: param.post.text,
            mediaUrl: param.post.mediaUrl ? await this.storageGateway.getDownloadUrl(param.post.mediaUrl) : null,
            mediaType: param.post.mediaType,
            thumbnail: param.post.thumbnail ? await this.storageGateway.getDownloadUrl(param.post.thumbnail) : null,
            authorId: param.user.id,
            liveCategoryId: param.post.liveCategoryId
        })

        const newPost = await this._postRepository.createPost(post);
        await this._eventDispatcher.dispatch(post);
        return newPost;

    }
}
