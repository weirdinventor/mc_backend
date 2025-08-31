import {Post} from "../aggregates/Post";
import {UpdatePostInput} from "../../usecases/feed/UpdatePost";


export interface FeedRepository {
    getPostById(id: string): Promise<Post>;

    createPost(param: Post): Promise<Post>;

    updatePost(param: UpdatePostInput): Promise<Post>;

    deletePost(id: string): Promise<void>;

    addReaction(param: { postId: string; emoji: string; userId: string }): Promise<Post>;
}