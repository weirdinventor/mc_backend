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
import {inject, injectable} from "inversify";
import {CreateResource} from "../../../core/write/usecases/resource/CreateResource";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {Response} from "express";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {CreateResourceCommand} from "./commands/CreateResourceCommand";
import {validateOrReject} from "class-validator";
import {GetGroupResources} from "../../../core/read/queries/resource/GetGroupResources";
import {GetGroupResourceById} from "../../../core/read/queries/resource/GetGroupResourceById";
import {UpdateResource} from "../../../core/write/usecases/resource/UpdateResource";
import {UpdateResourceCommand} from "./commands/UpdateResourceCommand";
import {DeleteResource} from "../../../core/write/usecases/resource/DeleteResource";

@injectable()
@JsonController("/resources")
export class ResourcesController {

    constructor(
        @inject(CreateResource) private readonly _createResource: CreateResource,
        @inject(GetGroupResources) private readonly _getGroupResources: GetGroupResources,
        @inject(GetGroupResourceById) private readonly _getGroupResourceById: GetGroupResourceById,
        @inject(UpdateResource) private readonly _updateResource: UpdateResource,
        @inject(DeleteResource) private readonly _deleteResource: DeleteResource
    ) {
    }


    @UseBefore(AuthenticationMiddleware)
    @Get('/:groupId')
    async getResources(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param('groupId') groupId: string
    ) {
        const resources = await this._getGroupResources.execute({
            user: req.identity,
            groupId
        })

        return res.status(200).json(resources);
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/:id/group/:groupId')
    async getResourceById(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Param('groupId') groupId: string
    ) {
        const resource = await this._getGroupResourceById.execute({
            resourceId: id,
            user: req.identity,
            groupId,
        });

        return res.status(200).json(resource ? resource : {});
    }

    @UseBefore(AuthenticationMiddleware)
    @Post('/')
    async createResource(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Body() cmd: CreateResourceCommand
    ) {
        const body = CreateResourceCommand.setProperties(cmd);
        await validateOrReject(body);

        const resource = await this._createResource.execute({
            user: req.identity,
            data: body
        })

        return res.status(201).json(resource.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put('/:id')
    async updateResource(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Param('id') id: string,
        @Body() cmd: UpdateResourceCommand
    ) {
        const body = UpdateResourceCommand.setProperties(cmd);
        await validateOrReject(body);

        const resource = await this._updateResource.execute({
            user: req.identity,
            resourceId: id,
            resource: body
        })

        return res.status(200).json(resource.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Delete('/:id/group/:groupId')
    async deleteResource(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Param('groupId') groupId: string,
        @QueryParam("isModule") isModule?: boolean
    ) {

        await this._deleteResource.execute({
            resourceId: id,
            user: req.identity,
            groupId,
            isModule
        });

        return res.status(200).json({
            message: "Resource deleted successfully"
        });
    }
}