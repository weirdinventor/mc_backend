import {Mapper} from "../../../core/write/domain/models/Mapper";
import {PersonalInformationReadModel} from "../../../core/read/models/PersonalInformationReadModel";

export class GetUserByIdReadModelMapper implements Mapper<any, PersonalInformationReadModel> {
    toDomain(raw: any): PersonalInformationReadModel {
        if (!raw) return null;
        return {
            id: raw.id,
            firstName: raw.firstName,
            lastName: raw.lastName,
            username: raw.username,
            email: raw.email,
            gender: raw.gender,
            role: raw.role,
            status: raw.status,
            isSubscribed: raw.isSubscribed,
            profilePicture: raw.profilePicture,
            updatedAt: raw.updatedAt,
            createdAt: raw.createdAt,
            deletedAt: raw.deletedAt !== null ? new Date(raw.deletedAt) : null
        }
    }
}