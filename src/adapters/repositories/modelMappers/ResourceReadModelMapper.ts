import {Mapper} from "../../../core/write/domain/models/Mapper";
import {ResourceReadModel} from "../../../core/read/models/ResourceReadModel";


export class ResourceReadModelMapper implements Mapper<any, ResourceReadModel> {

    toDomain(raw: any): ResourceReadModel {
        if (!raw) return null

        return {
            id: raw.id,
            title: raw.title,
            description: raw.description,
            url: raw.url,
            image: raw.image,
            groupId: raw.groupId,
            author: {
                id: raw.authorId,
                firstName: raw.firstName,
                lastName: raw.lastName,
                username: raw.username,
                email: raw.email,
                isSubscribed: raw.isSubscribed,
                role: raw.role,
                status: raw.status,
                profilePicture: raw.profilePicture,
                gender: raw.gender,
                createdAt: raw.userCreatedAt,
                updatedAt: raw.userUpdatedAt,
                deletedAt: raw.userDeletedAt !== null ? new Date(raw.deletedAt) : null
            },
            category: raw.category,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        }
    }
}