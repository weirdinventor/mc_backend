import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";
import {LiveRepository} from "../../domain/repositories/LiveRepository";

export interface DeleteGroupInput {
    user: UserIdentity;
    id: string;
    isModule?: boolean
}

@injectable()
export class DeleteGroup implements Usecase<DeleteGroupInput, void> {
    constructor(
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(Identifiers.conversationGroupGateway)
        private readonly _conversationGroupGateway: ConversationGroupGateway,
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: DeleteGroupInput): Promise<void> {
        const {id, user, isModule} = payload

        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const group = await this._groupRepository.getGroupById(id, {
            isModule
        });

        if (!group) throw new GroupErrors.GroupNotFound(isModule ? "MODULE_NOT_FOUND" : "GROUP_NOT_FOUND");

        group.deleteGroup(group.id)

        const live = await this._liveRepository.getLiveByGroupId(id);

        if (live) {
            await this._liveRepository.update({
                user,
                live: {
                    ...live.props,
                    groupId: null
                }
            })
        }

        await this._groupRepository.deleteGroup({
            groupId: group.id,
            isModule
        });
        await this._conversationGroupGateway.deleteGroup(group.id);
        await this._eventDispatcher.dispatch(group);

    }
}
