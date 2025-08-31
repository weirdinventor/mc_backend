import {inject, injectable} from "inversify";
import {GroupPermission} from "../../domain/types/GroupPermissions";
import {Usecase} from "../../domain/models/Usecase";
import {Group} from "../../domain/aggregates/Group";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {StorageGateway} from "../../domain/gateway/StorageGateway";
import {isValidUrl} from "../../domain/utils/Functions";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";
import { AccessLevel } from "../../domain/types/AccessLevel";

export interface UpdateGroupInput {
    user: UserIdentity;
    data: {
        id: string;
        name: string;
        subject: string;
        coverImage?: string;
        thumbnail?: string;
        permissions?: GroupPermission[];
        voiceRoomId?: string;
        accessLevel?: AccessLevel;
    },
    isModule?: boolean;
}

@injectable()
export class UpdateGroup implements Usecase<UpdateGroupInput, Group> {
    constructor(
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
    ) {
    }

    async execute(payload: UpdateGroupInput): Promise<Group> {

        const {data, user, isModule} = payload
        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const group = await this._groupRepository.getGroupById(data.id, {
            isModule
        });

        if (!group) throw new GroupErrors.GroupNotFound(isModule ? "MODULE_NOT_FOUND" : "GROUP_NOT_FOUND");

        group.updateGroup({
            ...data
        });

        const updatedGroup = await this._groupRepository.updateGroup({
            user,
            data: {
                id: group.props.id,
                ...data,
                 coverImage: isValidUrl(data.coverImage) ?
                     data.coverImage :
                     await this.storageGateway.getDownloadUrl(data.coverImage),
                 thumbnail: isValidUrl(data.thumbnail) ?
                     data.thumbnail :
                     await this.storageGateway.getDownloadUrl(data.thumbnail),
            },
            isModule
        });

        await this._eventDispatcher.dispatch(group)

        return updatedGroup;
    }
}
