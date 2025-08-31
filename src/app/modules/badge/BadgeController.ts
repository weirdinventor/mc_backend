import { inject, injectable } from "inversify";
import {
    Body,
    Delete,
    Get,
    JsonController,
    Param,
    Post,
    Req,
    Res,
    UseBefore
} from "routing-controllers";
import { Response } from "express";
import { validateOrReject } from "class-validator";
import { AuthenticatedRequest } from "../../config/AuthenticatedRequest";
import { AuthenticationMiddleware } from "../../middlewares/AuthenticationMiddleware";
import { CreateBadge } from "../../../core/write/usecases/badge/CreateBadge";
import { CreateBadgeCommand } from "./commands/CreateBadgeCommand";
import { AssignBadgeToUser } from "../../../core/write/usecases/badge/AssignBadgeToUser";
import { AssignBadgeCommand } from "./commands/AssignBadgeCommand";
import { RemoveBadgeFromUser } from "../../../core/write/usecases/badge/RemoveBadgeFromUser";
import { DeleteBadge } from "../../../core/write/usecases/badge/DeleteBadge";
import { GetUserBadges } from "../../../core/read/queries/badges/GetUserBadges";
import { GetAllBadges } from "../../../core/read/queries/badges/GetAllBadges";
import { UserRole } from "../../../core/write/domain/types/UserRole";
import { UnAuthorizedAction } from "../../config/models/UnAuthorizedAction";

@injectable()
@JsonController("/badge")
export class BadgeController {
    constructor(
        @inject(CreateBadge) private readonly _createBadge: CreateBadge,
        @inject(AssignBadgeToUser) private readonly _assignBadgeToUser: AssignBadgeToUser,
        @inject(RemoveBadgeFromUser) private readonly _removeBadgeFromUser: RemoveBadgeFromUser,
        @inject(DeleteBadge) private readonly _deleteBadge: DeleteBadge,
        @inject(GetUserBadges) private readonly _getUserBadges: GetUserBadges,
        @inject(GetAllBadges) private readonly _getAllBadges: GetAllBadges
    ) {}

    @Get()
    @UseBefore(AuthenticationMiddleware)
    async getAllBadges(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest
    ) {
        // Check if the user is admin
        if (Number(req.identity.role) !== UserRole.ADMIN) {
            return UnAuthorizedAction(res);
        }

        const badges = await this._getAllBadges.execute();

        return res.status(200).send(badges);
    }

    @Post()
    @UseBefore(AuthenticationMiddleware)
    async createBadge(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: CreateBadgeCommand
    ) {
        // Check if the user is admin
        if (Number(req.identity.role) !== UserRole.ADMIN) {
            return UnAuthorizedAction(res);
        }

        const body = CreateBadgeCommand.setProperties(cmd);
        await validateOrReject(body);

        const badge = await this._createBadge.execute({
            name: body.name,
            description: body.description,
            badgeType: body.badgeType,
            pictureUrl: body.pictureUrl
        });

        return res.status(201).send(badge);
    }

    @Post("/assign")
    @UseBefore(AuthenticationMiddleware)
    async assignBadge(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: AssignBadgeCommand
    ) {
        // Check if the user is admin
        if (Number(req.identity.role) !== UserRole.ADMIN) {
            return UnAuthorizedAction(res);
        }

        const body = AssignBadgeCommand.setProperties(cmd);
        await validateOrReject(body);

        await this._assignBadgeToUser.execute({
            userId: body.userId,
            badgeId: body.badgeId
        });

        return res.status(200).send({
            message: "Badge assigned successfully"
        });
    }

    @Delete("/:badgeId/user/:userId")
    @UseBefore(AuthenticationMiddleware)
    async removeBadge(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("badgeId") badgeId: string,
        @Param("userId") userId: string
    ) {
        // Check if the user is admin
        if (Number(req.identity.role) !== UserRole.ADMIN) {
            return UnAuthorizedAction(res);
        }

        await this._removeBadgeFromUser.execute({
            userId,
            badgeId
        });

        return res.status(200).send({
            message: "Badge removed successfully"
        });
    }

    @Get("/user/:userId")
    @UseBefore(AuthenticationMiddleware)
    async getUserBadges(
        @Res() res: Response,
        @Param("userId") userId: string
    ) {
        console.log(userId);
        const badges = await this._getUserBadges.execute({
            userId
        });

        return res.status(200).send(badges);
    }

    @Delete("/:badgeId")
    @UseBefore(AuthenticationMiddleware)
    async deleteBadge(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("badgeId") badgeId: string
    ) {
        // Check if the user is admin
        if (Number(req.identity.role) !== UserRole.ADMIN) {
            return UnAuthorizedAction(res);
        }

        await this._deleteBadge.execute({
            badgeId
        });

        return res.status(200).send({
            message: "Badge deleted successfully"
        });
    }
}
