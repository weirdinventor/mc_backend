import {Response} from "express";
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
import {CreateLiveCategory} from "../../../core/write/usecases/liveCategory/CreateLiveCategory";
import {GetLiveCategories} from "../../../core/write/usecases/liveCategory/GetLiveCategories";
import {DeleteLiveCategory} from "../../../core/write/usecases/liveCategory/DeleteLiveCategory";
import {UpdateLiveCategory} from "../../../core/write/usecases/liveCategory/UpdateLiveCategory";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {UpdateLiveCategoryCommand} from "./commands/UpdateLiveCategoryCommand";
import {validateOrReject} from "class-validator";
import {CreateLiveCategoryCommand} from "./commands/CreateLiveCategoryCommand";
import {GetLivesByStatusAndDate} from "../../../core/write/usecases/live/GetLivesByStatusAndDate";
import {LiveStatus} from "../../../core/write/domain/types/LiveStatus";
import {GetModuleLives} from "../../../core/write/usecases/modules/GetModuleLives";
import {GetGroupLives} from "../../../core/write/usecases/group/GetGroupLives";


@injectable()
@JsonController("/admin/live")
export class LiveAdminController {

    constructor(
        @inject(CreateLiveCategory) private readonly _createLiveCategory: CreateLiveCategory,
        @inject(GetLiveCategories) private readonly _getLiveCategories: GetLiveCategories,
        @inject(DeleteLiveCategory) private readonly _deleteLiveCategory: DeleteLiveCategory,
        @inject(UpdateLiveCategory) private readonly _updateLiveCategory: UpdateLiveCategory,
        @inject(GetLivesByStatusAndDate) private readonly _getLivesByStatusAndDate: GetLivesByStatusAndDate,
        @inject(GetModuleLives) private readonly _getModuleLives: GetModuleLives,
        @inject(GetGroupLives) private readonly _getGroupLives: GetGroupLives
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/")
    async getLives(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @QueryParam("status") status?: LiveStatus,
        @QueryParam("date") date?: Date) {


        const lives = await this._getLivesByStatusAndDate.execute({
            user: req.identity,
            filter: {
                status,
                date
            }
        });

        return res.status(200).json(lives.map((live) => live.props));

    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/module/:id")
    async getModuleLives(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string
    ) {

        const lives = await this._getModuleLives.execute({
            user: req.identity,
            moduleId: id
        });
        return res.status(200).json(lives.map((live) => live.props));
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/group/:id")
    async getGroupLives(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string
    ) {

        const lives = await this._getGroupLives.execute({
            user: req.identity,
            groupId: id
        });
        return res.status(200).json(lives.map((live) => live.props));
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/category")
    async getLiveCategories(@Res() res: Response) {
        const categories = await this._getLiveCategories.execute();
        return res.status(200).json(categories.map((category) => category.props));
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/category")
    async createLiveCategory(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: CreateLiveCategoryCommand) {

        const body = CreateLiveCategoryCommand.setProperties(cmd);
        await validateOrReject(body);

        const category = await this._createLiveCategory.execute({
            user: req.identity,
            name: body.name
        });

        return res.status(201).json(category.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete("/category/:id")
    async deleteLiveCategory(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Param("id") id: string) {
        await this._deleteLiveCategory.execute({
            user: req.identity,
            id
        });
        return res.status(200).json({
            message: "Live category deleted successfully",
        });
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/category/:id")
    async updateLiveCategory(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: UpdateLiveCategoryCommand,
        @Param("id") id: string
    ) {

        const body = UpdateLiveCategoryCommand.setProperties(cmd);
        await validateOrReject(body);

        const {name} = body;

        const category = await this._updateLiveCategory.execute({
            user: req.identity,
            category: {
                id,
                name
            }
        });
        return res.status(200).json(category.props);
    }
}