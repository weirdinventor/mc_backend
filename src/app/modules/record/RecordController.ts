import {Body, Get, JsonController, Param, Put, QueryParam, Req, Res, UseBefore} from "routing-controllers";
import {inject, injectable} from "inversify";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {Response} from "express";
import {GetLiveRecords} from "../../../core/write/usecases/live/GetLiveRecords";
import {UpdateRecord} from "../../../core/write/usecases/record/UpdateRecord";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {UpdateRecordCommand} from "./commands/UpdateRecordCommand";
import {validateOrReject} from "class-validator";
import {GetAllRecords} from "../../../core/write/usecases/record/GetAllRecords";
import {GetPublishedRecords} from "../../../core/read/queries/record/GetPublishedRecords";
import {GetRecordById} from "../../../core/read/queries/record/GetRecordById";


@injectable()
@JsonController("/record")
export class RecordController {

    constructor(
        @inject(GetLiveRecords) private readonly _getLiveRecords: GetLiveRecords,
        @inject(UpdateRecord) private readonly _updateRecord: UpdateRecord,
        @inject(GetPublishedRecords) private readonly _getPublishedRecords: GetPublishedRecords,
        @inject(GetAllRecords) private readonly _getAllRecords: GetAllRecords,
        @inject(GetRecordById) private readonly _getRecordById: GetRecordById,
    ) {
    }


    @UseBefore(AuthenticationMiddleware)
    @Get("/published/:recordId")
    async getRecord(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("recordId") id: string,
        @QueryParam("isModule") isModule?: boolean
    ) {

        const record = await this._getRecordById.execute({
            id,
            user: req.identity,
            isModule
        });
        return res.status(200).json(record ? record : {
            message: "Record not found"
        });
    }


    @UseBefore(AuthenticationMiddleware)
    @Get("/all")
    async getAllRecords(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @QueryParam("groupId") groupId?: string
    ) {
        const records = await this._getAllRecords.execute({
            user: req.identity,
            groupId
        });
        return res.status(200).json(records.map(record => record.props));
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/published")
    async getPublishedRecords(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @QueryParam("groupId") groupId?: string,
        @QueryParam("isModule") isModule?: boolean
    ) {

        const records = await this._getPublishedRecords.execute({
            user: req.identity,
            groupId,
        });
        return res.status(200).json(records);
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/live/:liveId")
    async getLiveRecord(
        @Res() res: Response,
        @Param("liveId") id: string
    ) {
        const record = await this._getLiveRecords.execute({
            liveId: id
        });
        return res.status(200).json(record.props);
    }

    @UseBefore(AuthenticationMiddleware)
    @Put("/:recordId")
    async updateRecord(
        @Res() res: Response,
        @Req() req: AuthenticatedRequest,
        @Param("recordId") id: string,
        @Body() cmd: UpdateRecordCommand
    ) {

        const body = UpdateRecordCommand.setProperties(cmd);
        await validateOrReject(body);

        const record = await this._updateRecord.execute({
            user: req.identity,
            data: {
                id,
                ...body
            }
        });

        return res.status(200).json(record.props);
    }
}