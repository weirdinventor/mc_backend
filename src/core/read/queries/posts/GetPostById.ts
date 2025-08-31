import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {GetPostsReadModel} from "../../models/GetPostsReadModel";
import {Identifiers} from "../../../Identifiers";
import {GetPostsReadModelRepository} from "../../repositories/GetPostsReadModelRepository";


export interface GetPostByIdInput {
    id: string
}


@injectable()
export class GetPostById implements Query<GetPostByIdInput, GetPostsReadModel> {
    constructor(
        @inject(Identifiers.getPostsReadModelRepository)
        private readonly getPostsReadModelRepository: GetPostsReadModelRepository
    ) {
    }

    async execute(request: GetPostByIdInput): Promise<GetPostsReadModel> {
        return await this.getPostsReadModelRepository.getPostById(request);
    }
}