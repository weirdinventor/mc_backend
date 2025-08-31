import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Group} from "../../domain/aggregates/Group";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";
import {UserRepository} from "../../domain/repositories/UserRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {UserErrors} from "../../domain/errors/UserErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";

export interface AddNewMemberInput {
    user: UserIdentity
    data: {
        groupId: string;
        userId: string;
    }
}

@injectable()
export class AddNewMember implements Usecase<AddNewMemberInput, Group> {
    constructor(
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(Identifiers.userRepository)
        private readonly _userRepository: UserRepository,
        @inject(Identifiers.conversationGroupGateway)
        private readonly _conversationGroupGateway: ConversationGroupGateway,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: AddNewMemberInput): Promise<Group> {
        const {groupId, userId} = payload.data;

        const role: UserRole = payload.user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const group = await this._groupRepository.getGroupById(groupId);

        if (!group) throw new GroupErrors.GroupNotFound();

        const user = await this._userRepository.getById(userId);

        if (!user) throw new UserErrors.UserNotFound();

        group.addMember({
            groupId: group.props.id,
            userId: user.props.id
        })

        const updatedGroup = await this._groupRepository.addNewMember({
            user: payload.user,
            data: payload.data
        });

        await this._conversationGroupGateway.addNewMember({
            groupId: updatedGroup.props.id,
            memberId: payload.data.userId
        })

        await this._eventDispatcher.dispatch(group)

        return updatedGroup;
    }
}
