import {FeedRepository} from "../../../core/write/domain/repositories/FeedRepository";
import {Post} from "../../../core/write/domain/aggregates/Post";
import {Reaction} from "../../../core/write/domain/aggregates/Reaction";
import {EntityManager} from "typeorm";
import {PostEntityMapper} from "./mappers/PostEntityMapper";
import {PostEntity} from "../entities/PostEntity";
import {UpdatePostInput} from "../../../core/write/usecases/feed/UpdatePost";
import {PostsMapperWithRelations} from "./mappers/PostsMapperWithRelations";
import {ReactionEntity} from "../entities/ReactionEntity";
import { ReactionEntityMapper } from "./mappers/ReactionEntityMapper";
import {FeedErrors} from "../../../core/write/domain/errors/FeedErrors";


export class PostgresPostRepository implements FeedRepository {

    private readonly postEntityMapper: PostEntityMapper
    private readonly reactionEntityMapper: ReactionEntityMapper
    private readonly postWithRelationsMapper: PostsMapperWithRelations

    constructor(
        private readonly entityManager: EntityManager
    ) {
        this.postEntityMapper = new PostEntityMapper(this.entityManager)
        this.reactionEntityMapper = new ReactionEntityMapper(this.entityManager)
        this.postWithRelationsMapper = new PostsMapperWithRelations(this.entityManager)
    }


    async getPostById(id: string): Promise<Post> {
        const postRepo = this.entityManager.getRepository(PostEntity)
        const post = await postRepo.findOne({
            where: {
                id
            },
            relations: ['reactions', 'author', 'liveCategory']
        })

        return this.postEntityMapper.toDomain(post)
    }

    async createPost(param: Post): Promise<Post> {
        const postRepo = this.entityManager.getRepository(PostEntity)
        const postEntity = this.postEntityMapper.fromDomain(param)

        const savedPost = await postRepo.save(postEntity)

        return this.postEntityMapper.toDomain(savedPost)
    }

    async updatePost(param: UpdatePostInput): Promise<Post> {
        const {id, text, mediaType, mediaUrl, liveCategoryId} = param;
        const postRepo = this.entityManager.getRepository(PostEntity)

        await postRepo.update(id, {
            mediaUrl,
            mediaType,
            text,
            liveCategoryId,
        })


        const updatedPost = await postRepo.findOne({
            where: {
                id
            },
            relations: ['liveCategory']
        })

        return this.postEntityMapper.toDomain(updatedPost)
    }

    async deletePost(id: string): Promise<void> {
        const postRepo = this.entityManager.getRepository(PostEntity)
        await postRepo.delete(id)
    }

    async addReaction(param: { postId: string; emoji: string; userId: string }): Promise<Post> {
        const reactionRepo = this.entityManager.getRepository(ReactionEntity)
        const reaction = await reactionRepo.findOne({
            where: {
                userId: param.userId,
                postId: param.postId
            }
        })
        let result: Reaction;

        if (reaction) {
            result = this.reactionEntityMapper.toDomain(reaction)
            result = Reaction.updateReaction({
                id: result.props.id,
                emoji: param.emoji,
                userId: result.props.userId,
                postId: result.props.postId
            })

        } else {
            result = Reaction.createReaction({
                emoji: param.emoji,
                userId: param.userId,
                postId: param.postId
            })
        }
        const reactionEntity = this.reactionEntityMapper.fromDomain(result)
        await reactionRepo.save(reactionEntity)

        return await this.getPostById(param.postId)
    }
}