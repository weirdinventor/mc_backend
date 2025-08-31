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
    UseBefore,
} from "routing-controllers";
import {CreateLive} from "../../../core/write/usecases/live/CreateLive";
import {CreateLiveCommand} from "./commands/CreateLiveCommand";
import {validateOrReject} from "class-validator";
import {Response} from "express";
import {GetLiveById} from "../../../core/write/usecases/live/GetLiveById";
import {UpdateLiveCommand} from "./commands/UpdateLiveCommand";
import {UpdateLive} from "../../../core/write/usecases/live/UpdateLive";
import {DeleteLive} from "../../../core/write/usecases/live/DeleteLive";
import {CancelLive} from "../../../core/write/usecases/live/CancelLive";
import {PublishLive} from "../../../core/write/usecases/live/PublishLive";
import {MarkAsOngoing} from "../../../core/write/usecases/live/MarkAsOngoing";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {GetLives} from "../../../core/read/queries/lives/GetLives";
import {GetLivesByTimeframe} from "../../../core/read/queries/lives/GetLivesByTimeframe";
import {LiveTimeframe} from "../../../core/write/domain/types/LiveTimeframe";
import {StopHlsStream} from "../../../core/write/usecases/videoSdk/StopHlsStream";
import {AddUserInterestToLiveCommand} from "./commands/AddUserInterestToLiveCommand";
import {AddUserInterestToLive} from "../../../core/write/usecases/live/AddUserInterestToLive";
import {RemoveUserInterestFromLive} from "../../../core/write/usecases/live/RemoveUserInterestFromLive";

@injectable()
@JsonController("/live")
export class LiveController {
    constructor(
        @inject(GetLives) private readonly _getLives: GetLives,
        @inject(GetLiveById) private readonly _getLiveById: GetLiveById,
        @inject(CreateLive) private readonly _createLive: CreateLive,
        @inject(UpdateLive) private readonly _updateLive: UpdateLive,
        @inject(DeleteLive) private readonly _deleteLive: DeleteLive,
        @inject(CancelLive) private readonly _cancelLive: CancelLive,
        @inject(PublishLive) private readonly _publishLive: PublishLive,
        @inject(MarkAsOngoing) private readonly _markAsOngoing: MarkAsOngoing,
        @inject(GetLivesByTimeframe) private readonly _getLivesByTimeframe: GetLivesByTimeframe,
        @inject(StopHlsStream) private readonly _stopHlsStream: StopHlsStream,
        @inject(AddUserInterestToLive) private readonly _addUserInterestToLive: AddUserInterestToLive,
        @inject(RemoveUserInterestFromLive) private readonly _removeUserInterestFromLive: RemoveUserInterestFromLive,
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/")
    async getLives(@Res() res: Response) {
        const lives = await this._getLives.execute();
        return res.status(200).json(lives);
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/one/:id")
    async getLiveById(@Res() res: Response, @Param("id") id: string) {
        const live = await this._getLiveById.execute(id);
        if (!live) {
            return res.status(404).json({message: "Live not found"});
        }

        return res.status(200).json(live.props);
    }


    @UseBefore(AuthenticationMiddleware)
    @Get("/filter")
    async getLivesByTimeframe(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @QueryParam("timeframe") timeframe: LiveTimeframe,
        @QueryParam("groupId") groupId?: string
    ) {

        if (!timeframe)
            return res.status(400).json({message: "Timeframe query param is required"});
        if (timeframe !== "future" && timeframe !== "ongoing")
            return res.status(400).json({message: "Invalid timeframe query param value. Valid values are 'future' and 'ongoing'"});

        const lives = await this._getLivesByTimeframe.execute({
            user: req.identity,
            timeframe,
            groupId,
        });

        return res.status(200).json(lives);
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/")
    async createLive(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() cmd: CreateLiveCommand) {
        const body = CreateLiveCommand.setProperties(cmd);
        await validateOrReject(body);

        const live = await this._createLive.execute({
            live: {
                title: body.title,
                description: body.description,
                coverImage: body.coverImage,
                airsAt: body.airsAt,
                accessLevel: body.accessLevel,
                duration: body.duration,
                categoryId: body.categoryId,
                groupId: body.groupId
            },
            user: req.identity,
            isModule: body.isModule
        });

        return res.status(201).json(live.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/:id")
    async updateLive(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: UpdateLiveCommand,
        @Param("id") id: string
    ) {
        const body = UpdateLiveCommand.setProperties(cmd);
        await validateOrReject(body);

        const {title, description, coverImage, airsAt, duration, accessLevel, status, categoryId} = body;

        const live = await this._updateLive.execute({
            live: {
                id,
                title,
                description,
                coverImage,
                airsAt,
                status,
                accessLevel,
                duration,
                categoryId
            },
            user: req.identity
        });

        return res.status(200).json(live.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/cancel/:id")
    async cancelLive(@Res() res: Response, @Param("id") id: string) {
        const live = await this._cancelLive.execute(id);

        return res.status(200).json(live.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/publish/:id")
    async publishLive(@Res() res: Response, @Param("id") id: string) {
        const live = await this._publishLive.execute(id);

        return res.status(200).json(live.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/ongoing/:id")
    async setLiveAsOngoing(@Res() res: Response, @Param("id") id: string) {
        const live = await this._markAsOngoing.execute({
            id
        });

        if (!live) return res.status(404).json({message: "Live not found"});

        return res.status(200).json(live.props);
    }


    @UseBefore(AuthenticationMiddleware)
    @Put("/stop/:id")
    async setLiveAsCompleted(
        @Res() response: Response,
        @Req() request: AuthenticatedRequest,
        @Param("id") id: string
    ) {
        await this._stopHlsStream.execute({
            user: request.identity,
            id
        })

        return response.status(200).json({
            message: "Live stream stopped successfully"
        })
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete("/:id")
    async deleteLive(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Param("id") id: string) {
        await this._deleteLive.execute({
            id,
            user: req.identity
        });

        return res.status(200).json({
            message: "Live deleted successfully",
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/interest")
    async interestLive(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: AddUserInterestToLiveCommand
    ) {
        const body = AddUserInterestToLiveCommand.setProperties(cmd);
        await validateOrReject(body);

        await this._addUserInterestToLive.execute({
            liveId: body.liveId,
            user: req.identity
        });

        return res.status(200).json({
            message: "User interest added successfully"
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete("/interest/:id")
    async removeInterestLive(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Param("id") liveId: string
    ) {
        await this._removeUserInterestFromLive.execute({
            liveId,
            user: req.identity
        });

        return res.status(200).json({
            message: "User interest removed successfully"
        });
    }
}
