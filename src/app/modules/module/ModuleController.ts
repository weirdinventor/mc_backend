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
import {CreateGroup} from "../../../core/write/usecases/group/CreateGroup";
import {GetGroups} from "../../../core/write/usecases/group/GetGroups";
import {GetModuleById} from "../../../core/write/usecases/modules/GetModuleById";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {Response} from "express";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {CreateGroupCommand} from "../group/commands/CreateGroupCommand";
import {validateOrReject} from "class-validator";
import {DeleteGroup} from "../../../core/write/usecases/group/DeleteGroup";
import {UpdateGroup} from "../../../core/write/usecases/group/UpdateGroup";
import {UpdateGroupCommand} from "../group/commands/UpdateGroupCommand";
import {CreatePurchase} from "../../../core/write/usecases/modulePurchase/CreatePurchase";
import {AccessLevel} from "../../../core/write/domain/types/AccessLevel";

@injectable()
@JsonController("/module")
export class ModuleController {

    constructor(
        @inject(CreateGroup) private readonly _createGroup: CreateGroup,
        @inject(GetGroups) private readonly _getGroups: GetGroups,
        @inject(GetModuleById) private readonly _getModuleById: GetModuleById,
        @inject(DeleteGroup) private readonly _deleteGroup: DeleteGroup,
        @inject(UpdateGroup) private readonly _updateGroup: UpdateGroup,
        @inject(CreatePurchase) private readonly _createPurchase: CreatePurchase
    ) {
    }


    @UseBefore(AuthenticationMiddleware)
    @Get("/")
    async getModules(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @QueryParam("paid") paid: boolean
    ) {

        const modules = await this._getGroups.execute({
            user: req.identity,
            isModule: true,
            paid: paid ?? false
        });

        return res.status(200).json(modules.map((module) => module.props));
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/:id")
    async getModuleById(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string
    ) {
        const module = await this._getModuleById.execute({
            id,
            user: req.identity,
        });
        return res.status(200).json(module.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/")
    async createModule(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: CreateGroupCommand
    ) {
        const body = CreateGroupCommand.setProperties(cmd);

        await validateOrReject(body);

        const module = await this._createGroup.execute({
            user: req.identity,
            data: body,
            isModule: true,
        });

        return res.status(201).json(module.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/:moduleId")
    async updateModule(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Body() cmd: UpdateGroupCommand,
        @Param("moduleId") id: string
    ) {
        const body = UpdateGroupCommand.setProperties(cmd);
        await validateOrReject(body);

        const {name, subject, thumbnail, coverImage, permissions, accessLevel} = body;

        const module = await this._updateGroup.execute({
            user: req.identity,
            data: {
                id,
                name,
                subject,
                coverImage,
                thumbnail,
                permissions,
                accessLevel: accessLevel ? accessLevel : AccessLevel.FREE,
            },
            isModule: true
        });

        return res.status(200).json(module.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete("/:moduleId")
    async deleteModule(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("moduleId") id: string
    ) {
        await this._deleteGroup.execute({
            user: req.identity,
            id,
            isModule: true
        });

        return res.status(200).json({
            message: "Module deleted successfully.",
        });
    }


    @UseBefore(AuthenticationMiddleware)
    @Post("/:moduleId/purchase")
    async purchaseModule(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("moduleId") moduleId: string
    ) {
        const module = await this._createPurchase.execute({
            user: req.identity,
            moduleId
        });

        return res.status(200).json(module.props);
    }
}
