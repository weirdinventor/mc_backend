import {AggregateRoot} from "../entities/AggregateRoot";
import {v4} from "uuid";
import {PostCreated} from "../../../../messages/events/feed/PostCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {PostUpdated} from "../../../../messages/events/feed/PostUpdated";
import {PostDeleted} from "../../../../messages/events/feed/PostDeleted";
import {PostMediaType} from "../types/PostMediaType";
import {UserProperties} from "./User";
import {ReactionProperties} from "./Reaction";
import { LiveCategoryProperties } from "./LiveCategory";


export interface PostProperties {
    id: string;
    text: string;
    mediaUrl?: string;
    mediaType: PostMediaType;
    thumbnail?: string;
    authorId: string;
    author?: UserProperties;
    reactions?: ReactionProperties[];
    liveCategoryId?: string;
    liveCategory?: LiveCategoryProperties;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Post extends AggregateRoot<PostProperties> {

    static restore(props: PostProperties) {
        return new Post(props);
    }

    static createPost(payload: {
        text: string;
        mediaUrl: string;
        mediaType: PostMediaType;
        authorId: string;
        thumbnail?: string;
        liveCategoryId?: string;
    }) {
        const {text, mediaType, mediaUrl, authorId, thumbnail, liveCategoryId} = payload;
        const post = new Post({
            id: v4(),
            text,
            mediaUrl,
            mediaType,
            authorId,
            thumbnail,
            liveCategoryId
        });

        post.applyChange(
            new PostCreated({
                text: post.props.text,
                mediaUrl: post.props.mediaUrl,
                mediaType: post.props.mediaType,
                thumbnail: post.props.thumbnail,
                liveCategoryId: post.props.liveCategoryId
            })
        );

        return post;
    }

    @Handle(PostCreated)
    private applyPostCreated(event: PostCreated) {
        this.props.text = event.props.text;
        this.props.mediaUrl = event.props.mediaUrl;
        this.props.mediaType = event.props.mediaType;
        this.props.thumbnail = event.props.thumbnail;
        this.props.liveCategoryId = event.props.liveCategoryId;
    }

    static updatePost(payload: {
        id: string;
        text: string;
        mediaUrl: string;
        mediaType: PostMediaType;
        authorId: string;
        thumbnail?: string;
        liveCategoryId?: string;
    }) {
        const {id, text, mediaUrl, mediaType, authorId, thumbnail, liveCategoryId} = payload;
        const post = new Post({
            id,
            text,
            mediaUrl,
            mediaType,
            authorId,
            thumbnail,
            liveCategoryId
        });

        post.applyChange(
            new PostUpdated({
                id: post.props.id,
                text: post.props.text,
                mediaUrl: post.props.mediaUrl,
                mediaType: post.props.mediaType,
                thumbnail: post.props.thumbnail,
                liveCategoryId: post.props.liveCategoryId
            })
        );

        return post;
    }

    @Handle(PostUpdated)
    private applyPostUpdated(event: PostUpdated) {
        this.props.id = event.props.id;
        this.props.text = event.props.text;
        this.props.mediaUrl = event.props.mediaUrl;
        this.props.mediaType = event.props.mediaType;
        this.props.thumbnail = event.props.thumbnail;
        this.props.liveCategoryId = event.props.liveCategoryId;
    }


    deletePost(payload: {
        id: string,
        authorId: string
    }) {
        const {id, authorId} = payload;

        this.applyChange(
            new PostDeleted({
                id
            })
        );

        return this;
    }

    @Handle(PostDeleted)
    private applyPostDeleted(event: PostDeleted) {
        this.props.id = event.props.id;
    }

}
