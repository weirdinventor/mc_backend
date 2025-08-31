import {inject, injectable} from "inversify";
import {SearchUserReadModel} from "../../models/SearchUserReadModel";
import {Query} from "../../../write/domain/models/Query";
import {Identifiers} from "../../../Identifiers";
import {SearchUserReadModelRepository} from "../../repositories/SearchUserReadModelRepository";
import {UserIdentity} from "../../../write/domain/entities/UserIdentity";

export interface SearchUserInput {
    user: UserIdentity;
    username: string;
}


@injectable()
export class SearchUser implements Query<SearchUserInput, SearchUserReadModel[]> {
    constructor(
        @inject(Identifiers.searchUserReadModelRepository)
        private readonly searchUserReadModelRepository: SearchUserReadModelRepository
    ) {
    }

    async execute(request: SearchUserInput): Promise<SearchUserReadModel[]> {
        return await this.searchUserReadModelRepository.searchUserByUsername(request.user, request.username);
    }

}