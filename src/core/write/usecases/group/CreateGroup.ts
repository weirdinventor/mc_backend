import {inject, injectable} from "inversify";
import {GroupPermission} from "../../domain/types/GroupPermissions";
import {Usecase} from "../../domain/models/Usecase";
import {Group} from "../../domain/aggregates/Group";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {StorageGateway} from "../../domain/gateway/StorageGateway";
import {StreamingGateway} from "../../domain/gateway/StreamingGateway";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";
import {AccessLevel} from "../../domain/types/AccessLevel";
import {ModuleErrors} from "../../domain/errors/ModuleErrors";

export interface CreateGroupInput {
    user: UserIdentity;
    data: {
        name: string;
        subject: string;
        coverImage?: string;
        thumbnail?: string;
        permissions?: GroupPermission[];
        accessLevel?: AccessLevel;
    },
    isModule: boolean;
}

@injectable()
export class CreateGroup implements Usecase<CreateGroupInput, Group> {
    constructor(
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(Identifiers.conversationGroupGateway)
        private readonly _conversationGroupGateway: ConversationGroupGateway,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
        @inject(Identifiers.streamingGateway)
        private readonly _streamingGateway: StreamingGateway,
    ) {
    }

    async execute(payload: CreateGroupInput): Promise<Group> {
        const {user, data, isModule} = payload

        if (isModule && !data.accessLevel) {
            throw new ModuleErrors.MissingAccessLevel()
        }

        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const group = Group.createGroup({
            ...data,
            coverImage: await this.storageGateway.getDownloadUrl(payload.data.coverImage),
            thumbnail: await this.storageGateway.getDownloadUrl(payload.data.thumbnail),
            isModule: isModule,
            accessLevel: data.accessLevel,
            ownerId: user.id
        });

        const newGroup = await this._groupRepository.createGroup(group);

        group.createVoiceRoom({
            id: newGroup.id
        })

        const voiceRoom = await this._streamingGateway.createRoom({
            user,
            id: newGroup.id,
            duration: 0,
            autoCloseConfig: "session-ends",
            hlsConfigMode: "audio"
        });

        const updatedGroup = await this._groupRepository.updateGroup({
            user,
            data: {
                ...group.props,
                voiceRoomId: voiceRoom.roomId
            },
            isModule
        });

        await this._conversationGroupGateway.initiate({
            creator: user.id,
            conversationGroupId: newGroup.props.id
        })

        await this._eventDispatcher.dispatch(group);

        return updatedGroup;
    }
}
