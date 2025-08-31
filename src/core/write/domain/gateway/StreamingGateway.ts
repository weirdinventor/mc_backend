import {StartHlsStreamInput, StartHlsStreamResponse} from "../../usecases/videoSdk/StartHlsStream";
import {StopHlsStreamInput} from "../../usecases/videoSdk/StopHlsStream";
import {UserRole} from "../types/UserRole";
import {JoinHlsStreamInput, JoinHlsStreamResponse} from "../../usecases/videoSdk/JoinHlsStream";
import {GetNumberOfParticipantsInput} from "../../usecases/videoSdk/GetNumberOfParticipants";
import {JoinVoiceRoomInput, JoinVoiceRoomResponse} from "../../usecases/videoSdk/JoinVoiceRoom";
import {UserIdentity} from "../entities/UserIdentity";
import {AutoCloseConfig, HlsConfigMode} from "../types/CreateRoomPayload";


export interface GenerateTokenPayload {
    participantId: string;
    roomId?: string;
    duration?: number;
    role?: UserRole;
}

export interface GetRecordingResponse {
    fileUrl: string;
}

export interface CreateRoomPayload {
    user: UserIdentity
    id: string;
    duration: number;
    autoCloseConfig: AutoCloseConfig;
    hlsConfigMode: HlsConfigMode;
}

export interface StreamingGateway {
    generateToken(payload: GenerateTokenPayload): string;

    generateWebhookPublicKey(): Promise<string>;

    verifyWebhookSignature(payload: {
        publicKey: string,
        signature: string | string[],
        body: any
    }): boolean;

    createRoom(payload: CreateRoomPayload): Promise<{
        roomId: string;
    }>;

    startHlsStream(payload: StartHlsStreamInput): Promise<StartHlsStreamResponse>;

    stopHlsStream(payload: StopHlsStreamInput): Promise<void>;

    joinHlsStream(payload: JoinHlsStreamInput): Promise<JoinHlsStreamResponse>;

    joinVoiceRoom(payload: JoinVoiceRoomInput): Promise<JoinVoiceRoomResponse>;

    getNumberOfParticipants(payload: GetNumberOfParticipantsInput): Promise<number>;

    getRecording(payload: {
        roomId: string,
        userId: string,
        sessionId?: string
    }): Promise<GetRecordingResponse>;
}
