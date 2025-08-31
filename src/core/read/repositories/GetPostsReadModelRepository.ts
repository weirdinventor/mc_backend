import {GetPostsInput} from "../queries/posts/GetPosts";
import {GetPostsReadModel} from "../models/GetPostsReadModel";
import {GetPostByIdInput} from "../queries/posts/GetPostById";


export interface GetPostsReadModelRepository {
    getPosts(param: GetPostsInput): Promise<{ posts: GetPostsReadModel[], total: number }>

    getPostById(param: GetPostByIdInput): Promise<GetPostsReadModel>
}