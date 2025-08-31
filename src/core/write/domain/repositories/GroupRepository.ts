import {AddNewMemberInput} from "../../usecases/group/AddNewMemeber";
import {Group} from "../aggregates/Group";
import {SearchGroupInput} from "../../usecases/group/SearchGroup";
import {GroupDtoProperties} from "../dtos/GroupDto";
import {GroupMemberDtoProperties} from "../dtos/GroupMembersDto";
import {UpdateGroupInput} from "../../usecases/group/UpdateGroup";
import {GetGroupsInput} from "../../usecases/group/GetGroups";

export interface GroupRepository {

    getGroupOrModuleById(id: string): Promise<Group>;

    getGroupById(groupId: string, param?: {
        isModule: boolean
    }): Promise<Group>;

    isUserMemberOfGroup(payload: { userId: string; groupId: string }): Promise<boolean>;

    isUserPurchasedModule(payload: { userId: string; moduleId: string }): Promise<boolean>;

    getGroups(param: {
        isModule?: boolean;
        paid?: boolean;
    }): Promise<Group[]>;

    searchGroup(param: SearchGroupInput): Promise<GroupDtoProperties[]>;

    getUserOwnedGroups(userId: string): Promise<GroupDtoProperties[]>;

    getUserJoinedGroups(userId: string): Promise<GroupDtoProperties[]>;

    getGroupMembers(groupId: string): Promise<GroupMemberDtoProperties[]>;

    createGroup(group: Group): Promise<Group>;

    updateGroup(group: UpdateGroupInput): Promise<Group>;

    deleteGroup(param: { groupId: string; isModule?: boolean }): Promise<void>;

    addNewMember(param: AddNewMemberInput): Promise<Group>;

}
