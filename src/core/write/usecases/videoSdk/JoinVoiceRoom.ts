import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {StreamingGateway} from "../../domain/gateway/StreamingGateway";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {ModuleErrors} from "../../domain/errors/ModuleErrors";

export interface JoinVoiceRoomInput {
    user: UserIdentity;
    groupId: string
}

export interface JoinVoiceRoomResponse {
    roomId: string;
    token: string;
}


@injectable()
export class JoinVoiceRoom implements Usecase<JoinVoiceRoomInput, JoinVoiceRoomResponse> {

    constructor(
        @inject(Identifiers.streamingGateway)
        private readonly _streamingGateway: StreamingGateway,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository
    ) {
    }

    async execute(payload: JoinVoiceRoomInput): Promise<JoinVoiceRoomResponse> {
        const {groupId} = payload

        const group = await this._groupRepository.getGroupOrModuleById(groupId);

        if (!group) {
            throw new GroupErrors.GroupNotFound("GROUP_OR_MODULE_NOT_FOUND");
        }

        if (group.props.isModule) {
            const isOwned = await this._groupRepository.isUserPurchasedModule({
                moduleId: groupId,
                userId: payload.user.id
            });
            if (!isOwned) {
                throw new ModuleErrors.ModuleNotOwned();
            }
        } else {
            const isMember = await this._groupRepository.isUserMemberOfGroup({
                groupId: groupId,
                userId: payload.user.id
            });
            
            if (!isMember) {
                throw new GroupErrors.GroupMemberNotFound();
            }
        }

        return await this._streamingGateway.joinVoiceRoom(payload);
    }
}