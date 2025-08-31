import {SearchUserReadModel} from "../models/SearchUserReadModel";
import {UserIdentity} from "../../write/domain/entities/UserIdentity";


export interface SearchUserReadModelRepository {
    searchUserByUsername(user: UserIdentity, username: string): Promise<SearchUserReadModel[]>
}