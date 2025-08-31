import {Mapper} from "../../../../core/write/domain/models/Mapper";
import {PostEntity} from "../../entities/PostEntity";
import {Post} from "../../../../core/write/domain/aggregates/Post";
import {EntityManager} from "typeorm";


export class PostEntityMapper implements Mapper<PostEntity, Post> {

    constructor(private readonly entityManager: EntityManager) {
    }

    fromDomain(t: Post): PostEntity {
        return this.entityManager.create(PostEntity, {
            id: t.id,
            text: t.props.text,
            mediaUrl: t.props.mediaUrl,
            mediaType: t.props.mediaType,
            thumbnail: t.props.thumbnail,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            authorId: t.props.authorId,
            liveCategoryId: t.props.liveCategoryId
        })
    }

    toDomain(raw: PostEntity): Post {
        console.log(raw)
        return Post.restore({
            id: raw.id,
            text: raw.text,
            mediaUrl: raw.mediaUrl,
            mediaType: raw.mediaType,
            thumbnail: raw.thumbnail,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            author: raw.author,
            authorId: raw.authorId,
            reactions: raw.reactions,
            liveCategory: raw.liveCategory && {
                id: raw.liveCategory.id,
                name: raw.liveCategory.name,
            }
        })
    }
}
