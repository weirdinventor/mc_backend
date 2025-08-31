import {injectable} from "inversify";
import {
    CreateRoomPayload,
    GenerateTokenPayload,
    GetRecordingResponse,
    StreamingGateway
} from "../../../core/write/domain/gateway/StreamingGateway";
import {VideoSdkConfig} from "../../../app/config/config";
import {sign} from "jsonwebtoken";
import axios, {AxiosInstance} from "axios";
import {StartHlsStreamInput, StartHlsStreamResponse} from "../../../core/write/usecases/videoSdk/StartHlsStream";
import {StopHlsStreamInput} from "../../../core/write/usecases/videoSdk/StopHlsStream";
import {EntityManager} from "typeorm";
import {LiveEntity} from "../../repositories/entities/LiveEntity";
import {UserRole} from "../../../core/write/domain/types/UserRole";
import {JoinHlsStreamInput, JoinHlsStreamResponse} from "../../../core/write/usecases/videoSdk/JoinHlsStream";
import {LiveStatus} from "../../../core/write/domain/types/LiveStatus";
import {GetNumberOfParticipantsInput} from "../../../core/write/usecases/videoSdk/GetNumberOfParticipants";
import crypto from "crypto"
import {JoinVoiceRoomInput, JoinVoiceRoomResponse} from "../../../core/write/usecases/videoSdk/JoinVoiceRoom";
import {GroupEntity} from "../../repositories/entities/GroupEntity";

@injectable()
export class VideosSdkGateway implements StreamingGateway {
    private readonly client: AxiosInstance;


    constructor(
        private readonly config: VideoSdkConfig,
        private readonly entityManager: EntityManager
    ) {
        this.client = axios.create({
            baseURL: this.config.baseUrl,
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    async createRoom(payload: CreateRoomPayload): Promise<{ roomId: string }> {
        const {autoCloseConfig, hlsConfigMode} = payload
        const token = this.generateToken({
            participantId: payload.user.id
        })
        const data = {
            "customRoomId": payload.id,
            "webhook": {
                "endPoint": this.config.webhookUrl,
                "events": ["recording-stopped"],
            },
            "autoCloseConfig": hlsConfigMode === "video-and-audio" ? {
                "type": autoCloseConfig,
                "duration": payload.duration
            } : undefined,
            "autoStartConfig": {
                recording: hlsConfigMode === "video-and-audio" ? {
                    transcription: {
                        enabled: false,
                    },
                    config: {
                        layout: {
                            type: 'SPOTLIGHT',
                            priority: 'PIN',
                        }
                    }
                } : undefined,
                hls: {
                    transcription: {
                        enabled: false,
                    },
                    config: {
                        layout: {
                            type: 'SPOTLIGHT',
                            priority: 'PIN',
                        },
                        mode: hlsConfigMode,
                        recording: false
                    }
                }
            },
        }

        console.log("[ CREATE ROOM BODY ]", JSON.stringify(data, null, 2));

        const result = await this.client.post('/rooms', data, {
            headers: {
                Authorization: `${token}`,
            }
        })

        console.log("[ RESULT ]", result);

        console.log(" [ TOKEN ] ", token);

        return {
            roomId: result.data.roomId
        }
    }

    async startHlsStream(payload: StartHlsStreamInput): Promise<StartHlsStreamResponse> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const {user, liveId} = payload

        const live = await liveRepo.findOne({
            where: {
                id: liveId,
            },
        })

        const token = this.generateToken({
            participantId: user.id,
            roomId: live.roomId,
            duration: live.duration,
            role: user.role
        })

        return {
            roomId: live.roomId,
            token
        }

    }

    async joinHlsStream(payload: JoinHlsStreamInput): Promise<JoinHlsStreamResponse> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const {user, liveId} = payload

        const live = await liveRepo.findOne({
            where: {
                id: liveId,
            },
        })

        const token = this.generateToken({
            roomId: live.roomId,
            duration: live.duration,
            participantId: user.id,
            role: user.role
        })

        return {
            roomId: live.roomId,
            token
        }
    }

    async joinVoiceRoom(payload: JoinVoiceRoomInput): Promise<JoinVoiceRoomResponse> {
        const groupRepo = this.entityManager.getRepository(GroupEntity);
        const {groupId, user} = payload

        const group = await groupRepo.findOne({
            where: {
                id: groupId
            }
        })

        const token = this.generateToken({
            roomId: group.voiceRoomId,
            participantId: user.id,
            role: user.role
        })

        return {
            roomId: group.voiceRoomId,
            token
        }
    }

    async stopHlsStream(payload: StopHlsStreamInput): Promise<void> {
        const {id} = payload
        const liveRepo = this.entityManager.getRepository(LiveEntity);

        const live = await liveRepo.findOne({
            where: {
                id,
            },
        })

        live.status = LiveStatus.COMPLETED
        await liveRepo.save(live)
    }

    async getNumberOfParticipants(payload: GetNumberOfParticipantsInput): Promise<number> {
        const {sessionId, user} = payload
        const token = this.generateToken({
            participantId: user.id
        })

        const response = await this.client.get(`/sessions/${sessionId}/participants`, {
            headers: {
                Authorization: `${token}`,
                "Content-Type": "application/json"
            }
        })

        const {pageInfo} = response.data
        return pageInfo.total
    }

    async getRecording(payload: { roomId: string; userId: string; sessionId?: string }): Promise<GetRecordingResponse> {

        const {roomId, sessionId, userId} = payload;
        const token = this.generateToken({
            participantId: userId
        });

        const baseUrl = 'https://api.videosdk.live/v2/recordings';
        const params = new URLSearchParams({
            roomId: roomId,
        });

        if (sessionId) {
            params.append('sessionId', sessionId);
        }

        const url = `${baseUrl}?${params.toString()}`;

        const response = await this.client.get(url, {
            headers: {
                Authorization: `${token}`,
                "Content-Type": "application/json"
            }
        })

        const {data} = response.data

        const result: GetRecordingResponse = data.length > 0 ? {
            fileUrl: data[0].file.fileUrl as string
        } : null;

        return result
    }

    generateToken(payload: GenerateTokenPayload): string {
        const {duration, roomId, participantId, role} = payload

        const API_KEY = this.config.apiKey;
        const SECRET = this.config.secret;


        const permissions =
            Number(role) === UserRole.ADMIN || Number(role) === UserRole.MODERATOR ?
                ["allow_join", "allow_mod"] : ["allow_join"];

        const tokenPayload = {
            apikey: API_KEY,
            permissions,
            version: 2,
            roomId,
            participantId
        };

        return sign(tokenPayload, SECRET, {
            expiresIn: duration ? `${duration}m` : '120m',
            algorithm: 'HS256'
        });
    }

    async generateWebhookPublicKey(): Promise<string> {
        const response = await this.client.get("/public/rsa-public-key")
        return response.data.publicKey as string;
    }

    verifyWebhookSignature(payload: { publicKey: string, signature: string; body: any }): boolean {
        const {publicKey, signature, body} = payload;

        return crypto.verify(
            'RSA-SHA256',
            Buffer.from(JSON.stringify(body)),
            publicKey,
            Buffer.from(signature, 'base64')
        );
    }

}
