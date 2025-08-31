import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Post} from "../../domain/aggregates/Post";
import {FeedRepository} from "../../domain/repositories/FeedRepository";
import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {PostMediaType} from "../../domain/types/PostMediaType";
import {FeedErrors} from "../../domain/errors/FeedErrors";
import {isValidUrl} from "../../domain/utils/Functions";
import {StorageGateway} from "../../domain/gateway/StorageGateway";


export interface UpdatePostInput {
    id: string;
    text: string;
    mediaUrl?: string;
    mediaType: PostMediaType;
    thumbnail?: string;
    authorId: string;
    liveCategoryId?: string;
}

@injectable()
export class UpdatePost implements Usecase<UpdatePostInput, Post> {

    constructor(
        @inject(Identifiers.feedRepository)
        private readonly _feedRepository: FeedRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
    ) {
    }

    async execute(request: UpdatePostInput): Promise<Post> {

        if (request.mediaType === PostMediaType.IMAGE && !request.mediaUrl) {
            throw new FeedErrors.CantCreatePost('MEDIA_URL_REQUIRED_FOR_IMAGE_POSTS');
        }

        if (request.mediaType === PostMediaType.IMAGE && request.thumbnail) {
            throw new FeedErrors.CantCreatePost('IMAGE_POSTS_DONT_NEED_THUMBNAIL');
        }

        if (request.mediaType === PostMediaType.VIDEO && !request.mediaUrl) {
            throw new FeedErrors.CantCreatePost('MEDIA_URL_REQUIRED_FOR_VIDEO_POSTS');
        }

        if (request.mediaType === PostMediaType.VIDEO && !request.thumbnail) {
            throw new FeedErrors.CantCreatePost('THUMBNAIL_REQUIRED_FOR_VIDEO_POSTS');
        }


        const post = Post.updatePost({
            id: request.id,
            text: request.text,
            mediaUrl: !request.mediaUrl ? null : request.mediaUrl && isValidUrl(request.mediaUrl) ?
                request.mediaUrl :
                await this.storageGateway.getDownloadUrl(request.mediaUrl),
            thumbnail: !request.mediaUrl ? null : request.thumbnail && isValidUrl(request.thumbnail) ?
                request.thumbnail :
                await this.storageGateway.getDownloadUrl(request.thumbnail),
            mediaType: request.mediaType,
            authorId: request.authorId,
            liveCategoryId: request.liveCategoryId
        })

        const newPost = await this._feedRepository.updatePost(request);
        await this._eventDispatcher.dispatch(post);
        return newPost;
    }

}
