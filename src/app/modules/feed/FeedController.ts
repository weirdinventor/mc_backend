import {inject, injectable} from "inversify";
import {
    Body,
    Delete,
    Get,
    JsonController,
    Param,
    Post,
    Put,
    QueryParam,
    Req,
    Res,
    UseBefore
} from "routing-controllers";
import {Response} from 'express'
import {NewPostCommand} from "./commands/NewPostCommand";
import {CreatePost} from "../../../core/write/usecases/feed/CreatePost";
import {validateOrReject} from "class-validator";
import {UpdatePostCommand} from "./commands/UpdatePostCommand";
import {UpdatePost} from "../../../core/write/usecases/feed/UpdatePost";
import {DeletePost} from "../../../core/write/usecases/feed/DeletePost";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {GetPosts} from "../../../core/read/queries/posts/GetPosts";
import {GetPostById} from "../../../core/read/queries/posts/GetPostById";
import {AddReaction} from "../../../core/write/usecases/feed/AddReaction";
import {ReactionCommand} from "./commands/ReactionCommand";

@injectable()
@JsonController("/feed")
export class FeedController {

    constructor(
        @inject(GetPosts) private readonly _getPosts: GetPosts,
        @inject(GetPostById) private readonly _getPostsById: GetPostById,
        @inject(CreatePost) private readonly _createPost: CreatePost,
        @inject(UpdatePost) private readonly _updatePost: UpdatePost,
        @inject(DeletePost) private readonly _deletePost: DeletePost,
        @inject(AddReaction) private readonly _addReaction: AddReaction,
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/posts')
    async getPosts(
        @Res() res: Response,
        @QueryParam("page") page: number,
        @QueryParam("categoryId") categoryId?: string
    ) {

        if (!page || typeof page !== "number") {
            return res.status(400).json({
                message: 'Missing or invalid page query parameter.'
            })
        }

        const take = 4
        const skip = (page - 1) * take

        const result = await this._getPosts.execute({
            take,
            skip,
            liveCategoryId: categoryId
        })
        return res.status(200).json({
            posts: result.posts,
            pagination: {
                totalItems: result.total,
                totalPages: Math.ceil(result.total / take),
                currentPage: page,
            }
        })
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/post/:id')
    async getPostById(
        @Res() res: Response,
        @Param('id') id: string
    ) {
        const post = await this._getPostsById.execute({
            id
        })

        if (!post) {
            return res.status(404).json({
                message: 'Post not found.'
            })
        }

        return res.status(200).json(post)
    }

    @UseBefore(AuthenticationMiddleware)
    @Post('/new-post')
    async createPost(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: NewPostCommand
    ) {
        const body = NewPostCommand.setProperties(cmd);
        await validateOrReject(body);

        const post = await this._createPost.execute({
            user: req.identity,
            post: cmd
        })
        return res.status(201).json(post.props)
    }

    @UseBefore(AuthenticationMiddleware)
    @Put('/update-post/:id')
    async updatePost(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: UpdatePostCommand,
        @Param('id') id: string
    ) {
        const body = UpdatePostCommand.setProperties(cmd);
        await validateOrReject(body);

        console.log({
            id: id,
            mediaUrl: cmd.mediaUrl,
            mediaType: cmd.mediaType,
            text: cmd.text,
            thumbnail: cmd.thumbnail,
            authorId: req.identity.id,
            liveCategoryId: cmd.liveCategoryId
        })

        const post = await this._updatePost.execute({
            id: id,
            mediaUrl: cmd.mediaUrl,
            mediaType: cmd.mediaType,
            text: cmd.text,
            thumbnail: cmd.thumbnail,
            authorId: req.identity.id,
            liveCategoryId: cmd.liveCategoryId
        })
        return res.status(200).json(post.props)
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete('/delete-post/:id')
    async deletePost(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Param('id') id: string
    ) {
        await this._deletePost.execute({
            id,
            authorId: req.identity.id
        })

        return res.status(200).json({
            message: 'Post deleted successfully.'
        })
    }

    @UseBefore(AuthenticationMiddleware)
    @Post('/:id/react')
    async react(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: ReactionCommand,
        @Param('id') id: string
    ) {
        const body = ReactionCommand.setProperties(cmd);
        await validateOrReject(body);

        return await this._addReaction.execute({
            user: req.identity,
            postId: id,
            emoji: body.emoji
        })
    }
}
