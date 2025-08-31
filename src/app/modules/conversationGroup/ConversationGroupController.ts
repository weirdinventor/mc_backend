import {inject, injectable} from "inversify";
import {Body, JsonController, Post, Req, Res, UseBefore} from "routing-controllers";
import {SendGroupMessage} from "../../../core/write/usecases/firebase/SendGroupMessage";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {Response} from "express";
import {SendGroupMessageCommand} from "./commands/SendGroupMessageCommand";
import {validateOrReject} from "class-validator";

@injectable()
@JsonController("/conversation-group")
export class ConversationGroupController {

    constructor(
        @inject(SendGroupMessage) private readonly _sendGroupMessage: SendGroupMessage
    ) {
    }


    @UseBefore(AuthenticationMiddleware)
    @Post("/message")
    async sendMessage(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: SendGroupMessageCommand
    ) {
        const body = SendGroupMessageCommand.setProperties(cmd)
        await validateOrReject(body)

        await this._sendGroupMessage.execute({
            senderId: req.identity.id,
            message: {
                text: body.text,
                media: body.media,
                audio: body.audio,
                type: body.type
            },
            conversationId: body.conversation
        })

        return res.status(200).json({message: "Message sent successfully"})
    }
}