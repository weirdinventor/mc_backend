import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {GetPostsReadModel} from "../../models/GetPostsReadModel";
import {Identifiers} from "../../../Identifiers";
import {GetPostsReadModelRepository} from "../../repositories/GetPostsReadModelRepository";


export interface GetPostsInput {
    take: number
    skip: number
    liveCategoryId?: string
}


@injectable()
export class GetPosts implements Query<GetPostsInput, { posts: GetPostsReadModel[], total: number }> {

    constructor(
        @inject(Identifiers.getPostsReadModelRepository)
        private readonly getPostsReadModelRepository: GetPostsReadModelRepository
    ) {
    }

    async execute(request: GetPostsInput): Promise<{ posts: GetPostsReadModel[], total: number }> {
        return await this.getPostsReadModelRepository.getPosts(request);
    }
}
