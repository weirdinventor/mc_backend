import {inject, injectable} from "inversify";
import {Get, JsonController, Param, QueryParam, Req, Res, UseBefore} from "routing-controllers";
import {AdminGetResources} from "../../../core/read/queries/resource/AdminGetResources";
import {AdminGetResourceById} from "../../../core/read/queries/resource/AdminGetResourceById";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {Response} from "express";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";


@injectable()
@JsonController("/admin/resources")
export class ResourcesAdminController {

    constructor(
        @inject(AdminGetResources) private readonly _adminGetResources: AdminGetResources,
        @inject(AdminGetResourceById) private readonly _adminGetResourceById: AdminGetResourceById
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/:groupId')
    async getResources(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param('groupId') groupId: string,
        @QueryParam("isModule") isModule?: boolean
    ) {
        const resources = await this._adminGetResources.execute({
            user: req.identity,
            groupId,
            isModule
        })

        return res.status(200).json(resources);
    }

    @UseBefore(AuthenticationMiddleware)
    @Get('/:id/group/:groupId')
    async getResourceById(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Param('groupId') groupId: string,
        @QueryParam("isModule") isModule?: boolean
    ) {
        const resource = await this._adminGetResourceById.execute({
            resourceId: id,
            user: req.identity,
            groupId,
            isModule
        });

        return res.status(200).json(resource ? resource : {});
    }

}