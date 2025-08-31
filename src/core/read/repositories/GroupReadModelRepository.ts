import {GroupMembersReadModel} from "../models/GroupMembersReadModel";

export interface GroupReadModelRepository {
    getGroupMembers(groupId: string): Promise<GroupMembersReadModel[]>
}