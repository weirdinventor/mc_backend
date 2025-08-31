import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {GroupMembersReadModel} from "../../models/GroupMembersReadModel";
import {GroupReadModelRepository} from "../../repositories/GroupReadModelRepository";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../../write/domain/repositories/GroupRepository";
import {GroupErrors} from "../../../write/domain/errors/GroupErrors";


export interface GetGroupMembersInput {
    groupId: string;
}

@injectable()
export class GetGroupMembers implements Query<GetGroupMembersInput, GroupMembersReadModel[]> {

    constructor(
        @inject(Identifiers.groupReadModelRepository)
        private readonly getGroupMembersReadModelRepository: GroupReadModelRepository,
        @inject(Identifiers.groupRepository)
        private readonly groupRepository: GroupRepository
    ) {
    }

    async execute(payload: GetGroupMembersInput): Promise<GroupMembersReadModel[]> {
        const {groupId} = payload
        const group = await this.groupRepository.getGroupById(payload.groupId);

        if (!group) throw new GroupErrors.GroupNotFound();

        return await this.getGroupMembersReadModelRepository.getGroupMembers(groupId);
    }
}