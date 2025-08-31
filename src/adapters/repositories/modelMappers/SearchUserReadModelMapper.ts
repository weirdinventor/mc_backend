import {Mapper} from "../../../core/write/domain/models/Mapper";
import {SearchUserReadModel} from "../../../core/read/models/SearchUserReadModel";

export class SearchUserReadModelMapper implements Mapper<any, SearchUserReadModel> {
    toDomain(raw: any): SearchUserReadModel {
        if (!raw) return null;
        return {
            id: raw.id,
            username: raw.username,
            profilePicture: raw.profilePicture,
            createdAt: raw.createdAt
        }
    }
}