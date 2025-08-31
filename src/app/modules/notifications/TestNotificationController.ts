import {inject, injectable} from "inversify";
import {Get, JsonController, QueryParam, Req, Res, UseBefore} from "routing-controllers";
import {PushNotificationGateway} from "../../../core/write/domain/gateway/PushNotificationGateway";
import {Identifiers} from "../../../core/Identifiers";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import { Response } from "express";
import {v4} from "uuid";

@injectable()
@JsonController('/notifications')
export class TestNotificationController {
    constructor(
        @inject(Identifiers.pushNotificationGateway)
        private readonly _notificationProvider: PushNotificationGateway
    ) {
    }

    // @UseBefore(AuthenticationMiddleware)
    @Get("/message")
    async sendTestMessage(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @QueryParam('token') token: string,
    ) {
        await this._notificationProvider.send({
            notification: {
                title: 'Test',
                body: 'This is a test notification'
            },
            data: { id: v4()},
            registrationToken: token,
        })

        return res.status(200).json({message: 'OK'});
    }

}