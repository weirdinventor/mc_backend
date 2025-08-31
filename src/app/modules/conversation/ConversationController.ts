import {inject, injectable} from "inversify";
import {Body, Delete, Get, JsonController, Param, Post, QueryParam, Req, Res, UseBefore} from "routing-controllers";
import {CreateConversation} from "../../../core/write/usecases/conversation/CreateConversation";
import {Response} from "express";
import {CreateConversationCommand} from "./commands/CreateConversationCommand";
import {validateOrReject} from "class-validator";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {GetConversations} from "../../../core/read/queries/conversations/GetConversations";
import {SendMessage} from "../../../core/write/usecases/firebase/SendMessage";
import {SendMessageCommand} from "./commands/SendMessageCommand";
import {IsConversationExist} from "../../../core/write/usecases/conversation/IsConversationExist";
import {DeleteConversation} from "../../../core/write/usecases/conversation/DeleteConversation";

@injectable()
@JsonController("/conversation")
export class ConversationController {
    constructor(
        @inject(CreateConversation) private readonly _createConversation: CreateConversation,
        @inject(GetConversations) private readonly _getConversations: GetConversations,
        @inject(SendMessage) private readonly _sendMessage: SendMessage,
        @inject(IsConversationExist) private readonly _isConversationExist: IsConversationExist,
        @inject(DeleteConversation) private readonly _deleteConversation: DeleteConversation
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/")
    async getConversations(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @QueryParam("page") page: number
    ) {


        page = page || 1
        const take = 10
        const skip = (page - 1) * take

        const {conversations, count} = await this._getConversations.execute({
            userId: req.identity.id,
            take,
            skip
        })

        return res.status(200).json({
            conversations: conversations,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(conversations.length / take),
                currentPage: page,
            }
        })
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/")
    async createConversation(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: CreateConversationCommand
    ) {
        const body = CreateConversationCommand.setProperties(cmd);
        await validateOrReject(body);


        const {participant} = body;
        const startedBy = req.identity.id;

        const conversation = await this._createConversation.execute({
            startedBy,
            participant
        });

        return res.status(200).json({
            conversation: conversation.props
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/message")
    async sendMessage(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: SendMessageCommand
    ) {

        const body = SendMessageCommand.setProperties(cmd);
        await validateOrReject(body);

        const {
            text,
            media,
            audio,
            type,
            conversation
        } = body

        await this._sendMessage.execute({
            conversationId: conversation,
            message: {
                text,
                media,
                audio,
                type
            },
            senderId: req.identity.id
        })

        return res.status(200).json({
            message: "Message sent"
        })
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/exist/:userId")
    async isConversationExist(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("userId") participant: string
    ) {

        const conversation = await this._isConversationExist.execute({
            senderId: req.identity.id,
            receiverId: participant
        })

        return res.status(200).json(conversation ? conversation : {})
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete("/:id")
    async deleteConversation(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("id") conversationId: string
    ) {
        await this._deleteConversation.execute({
            id: conversationId
        })

        return res.status(200).json({
            message: "Conversation deleted"
        })
    }
}