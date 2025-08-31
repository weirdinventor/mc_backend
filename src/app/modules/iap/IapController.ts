import {injectable} from "inversify";
import {Response} from 'express';
import {ProcessReceipt} from "../../../core/write/usecases/iap/ProcessReceipt";
import {Body, JsonController, Post, Req, Res, UseBefore} from "routing-controllers";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {ProcessReceiptCommand} from "./commands/ProcessReceiptCommand";
import {HandleSubscription} from "../../../core/write/usecases/iap/HandleSubscription";

@JsonController('/iap')
@injectable()
export class IapController {
    constructor(
        private readonly _processReceipt: ProcessReceipt,
        private readonly _handleSubscription: HandleSubscription
    ) {
    }


    @UseBefore(AuthenticationMiddleware)
    @Post('/receipt')
    async processReceipt(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() body: ProcessReceiptCommand,
    ) {

        const result = await this._processReceipt.execute({
            os: body.os,
            receiptData: body.receiptId,
            subscriptionId: body.subscriptionId,
            user: req.identity,
        })

        const user = await this._handleSubscription.execute({
            subDetails: result,
            user: req.identity
        })

        return res.status(200).json(user.props)
    }
}