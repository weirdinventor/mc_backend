import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {Group} from "../../domain/aggregates/Group";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {ConversationGroupGateway} from "../../domain/gateway/ConversationGroupGateway";

export interface GetGroupByIdInput {
    id: string
    user: UserIdentity
}

@injectable()
export class GetGroupById implements Usecase<GetGroupByIdInput, Group> {

    constructor(
        @inject(Identifiers.groupRepository)
        private groupRepository: GroupRepository,
        @inject(Identifiers.conversationGroupGateway)
        private conversationGroupGateway: ConversationGroupGateway,
    ) {
    }

    async execute(payload: GetGroupByIdInput): Promise<Group> {

        let group = await this.groupRepository.getGroupById(payload.id, {
            isModule: false
        });

        if (!group) {
            throw new GroupErrors.GroupNotFound();
        }

        const isMember = await this.groupRepository.isUserMemberOfGroup({
            groupId: group.props.id,
            userId: payload.user.id
        })

        if (!isMember) {
            // Save member to database
            group = await this.groupRepository.addNewMember({
                user: payload.user,
                data: {
                    groupId: group.props.id,
                    userId: payload.user.id
                }
            });

            // Save member to firebase realtime database
            await this.conversationGroupGateway.addNewMember({
                groupId: group.props.id,
                memberId: payload.user.id
            })
        }

        return group;

    }
}