import {Mapper} from "../../../core/write/domain/models/Mapper";
import {GetPostsReadModel} from "../../../core/read/models/GetPostsReadModel";


export class GetPostsReadModelMapper implements Mapper<any, GetPostsReadModel> {
    toDomain(raw: any): GetPostsReadModel {

        if (!raw) return null

        return {
            id: raw.postId,
            text: raw.text,
            mediaUrl: raw.mediaUrl,
            mediaType: raw.mediaType,
            thumbnail: raw.thumbnail || null,
            authorId: raw.authorId,
            author: {
                id: raw.authorId,
                username: raw.username,
                email: raw.email,
                phone: raw.phone,
                role: raw.role,
                status: raw.status,
                profilePicture: raw.profilePicture,
                signInAt: raw.signInAt,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            liveCategoryId: raw.liveCategoryId,
            reactions: raw.reactions?.map(r => {
                return {
                    id: r.id,
                    emoji: r.emoji,
                    userId: r.userId
                }
            }),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        }

    }
}
