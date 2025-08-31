import {inject, injectable} from "inversify";
import {Body, Get, JsonController, Post, Req, Res, UseBefore} from "routing-controllers";
import {StartHlsStream} from "../../../core/write/usecases/videoSdk/StartHlsStream";
import {AuthenticationMiddleware} from "../../middlewares/AuthenticationMiddleware";
import {Request, Response} from "express";
import {AuthenticatedRequest} from "../../config/AuthenticatedRequest";
import {StartHlsStreamCommand} from "./commands/StartHlsStreamCommand";
import {validateOrReject} from "class-validator";
import {JoinHlsStreamCommand} from "./commands/JoinHlsStreamCommand";
import {JoinHlsStream} from "../../../core/write/usecases/videoSdk/JoinHlsStream";
import {GetNumberOfParticipants} from "../../../core/write/usecases/videoSdk/GetNumberOfParticipants";
import {StreamingGateway} from "../../../core/write/domain/gateway/StreamingGateway";
import {Identifiers} from "../../../core/Identifiers";
import {CreateRecord} from "../../../core/write/usecases/record/CreateRecord";
import {SaveRecord} from "../../../core/write/usecases/live/SaveRecord";
import {JoinVoiceRoom} from "../../../core/write/usecases/videoSdk/JoinVoiceRoom";
import {JoinVoiceRoomCommand} from "./commands/JoinVoiceRoomCommand";

@injectable()
@JsonController("/stream")
export class StreamController {

    constructor(
        @inject(StartHlsStream) private readonly _startHlsStream: StartHlsStream,
        @inject(JoinHlsStream) private readonly _joinHlsStream: JoinHlsStream,
        @inject(GetNumberOfParticipants) private readonly _getNumberOfParticipants: GetNumberOfParticipants,
        @inject(CreateRecord)
        private _createRecord: CreateRecord,
        @inject(SaveRecord)
        private _saveRecord: SaveRecord,
        @inject(Identifiers.streamingGateway)
        private _streamingGateway: StreamingGateway,
        @inject(JoinVoiceRoom) private readonly _joinVoiceRoom: JoinVoiceRoom
    ) {
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/start")
    async startHlsStream(
        @Res() response: Response,
        @Req() request: AuthenticatedRequest,
        @Body() cmd: StartHlsStreamCommand
    ) {
        const body = StartHlsStreamCommand.setProperties(cmd)
        await validateOrReject(body)

        const result = await this._startHlsStream.execute({
            user: request.identity,
            liveId: cmd.liveId
        })

        return response.status(200).json(result)
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/join")
    async joinHlsStream(
        @Res() response: Response,
        @Req() request: AuthenticatedRequest,
        @Body() cmd: JoinHlsStreamCommand
    ) {
        const body = JoinHlsStreamCommand.setProperties(cmd)
        await validateOrReject(body)

        const result = await this._joinHlsStream.execute({
            user: request.identity,
            liveId: cmd.liveId
        })

        return response.status(200).json(result)
    }

    @UseBefore(AuthenticationMiddleware)
    @Post("/voice/join")
    async joinVoiceRoom(
        @Res() response: Response,
        @Req() request: AuthenticatedRequest,
        @Body() cmd: JoinVoiceRoomCommand
    ) {

        const body = JoinVoiceRoomCommand.setProperties(cmd)
        await validateOrReject(body)

        const result = await this._joinVoiceRoom.execute({
            user: request.identity,
            groupId: body.groupId
        });
        return response.status(200).json(result);
    }

    @UseBefore(AuthenticationMiddleware)
    @Get("/participants/:sessionId")
    async getNumberOfParticipants(
        @Res() response: Response,
        @Req() request: AuthenticatedRequest
    ) {
        const result = await this._getNumberOfParticipants.execute({
            user: request.identity,
            sessionId: request.params.sessionId
        })

        return response.status(200).json({
            participants: result
        })
    }

    @Post("/webhook")
    async webhook(
        @Res() response: Response,
        @Req() request: Request,
        @Body() body: any
    ) {

        console.log("\n\n [WEBHOOK RECEIVED] \n\n")

        const signature = request.headers['videosdk-signature'];

        const publicKey = await this._streamingGateway.generateWebhookPublicKey();
        const isVerified = this._streamingGateway.verifyWebhookSignature({
            signature,
            publicKey,
            body
        });

        if (isVerified) {
            const event = body.webhookType;

            switch (event) {
                case "recording-stopped":
                    const roomId = body.data.meetingId;

                    const savedRecord = await this._createRecord.execute({
                        fileUrl: body.data.fileUrl
                    });

                    await this._saveRecord.execute({
                        roomId,
                        record: savedRecord
                    });

                    break;
                default:
                    break;
            }
        }

        return response.sendStatus(200);
    }

}