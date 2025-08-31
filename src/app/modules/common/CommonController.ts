import {inject, injectable} from "inversify";
import {Body, Get, JsonController, Param, Post, Req, Res, UseBefore} from "routing-controllers";
import {Response, Request} from "express";
import {verify} from "jsonwebtoken";
import * as process from "process";
import {ActivateUser} from "../../../core/write/usecases/authentication/ActivateUser";
import {IsUsernameTaken} from "../../../core/write/usecases/user/IsUsernameTaken";
import {IsUsernameAvailableCommand} from "./commands/IsUsernameAvailableCommand";
import {validateOrReject} from "class-validator";
import {IsEmailTaken} from "../../../core/write/usecases/user/IsEmailTaken";
import {IsEmailAvailableCommand} from "./commands/IsEmailAvailableCommand";

@injectable()
@JsonController('/common')
export class CommonController {

    constructor(
        @inject(ActivateUser)
        private readonly _activateUser: ActivateUser,
        @inject(IsUsernameTaken)
        private readonly _getProfileByUsername: IsUsernameTaken,
        @inject(IsEmailTaken)
        private readonly _isEmailTaken: IsEmailTaken
    ) {
    }

    @Get('')
    async httpOk(@Res() res: Response
    ) {
        return res.sendStatus(200);
    }

    @Get('/:encrypted_id')
    async getAccountLink(
        @Res() res: Response,
        @Param('encrypted_id') encryptedId: string
    ) {
        const payload = verify(encryptedId, process.env.JWT_SECRET) as any;
        await this._activateUser.execute({userId: payload.id})
        //return res.redirect(301, process.env.FRONTEND_URL)
        return res.sendStatus(200)
    }

    @Post('/username')
    async isUsernameAvailable(@Req() req: Request, @Res() res: Response, @Body() cmd: IsUsernameAvailableCommand) {
        const body = IsUsernameAvailableCommand.setProperties(cmd);
        await validateOrReject(body);
        const result = await this._getProfileByUsername.execute({username: body.username})
        return res.status(200).send(result)
    }

    @Post('/email')
    async isEmailTaken(@Req() req: Request, @Res() res: Response, @Body() cmd: IsEmailAvailableCommand) {
        const body = IsEmailAvailableCommand.setProperties(cmd);
        await validateOrReject(body);
        const result = await this._isEmailTaken.execute({username: body.email})
        return res.status(200).send({taken: result})
    }
}
