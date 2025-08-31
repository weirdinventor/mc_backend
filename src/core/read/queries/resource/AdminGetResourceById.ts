import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {ResourceReadModel} from "../../models/ResourceReadModel";
import {Identifiers} from "../../../Identifiers";
import {ResourceReadModelRepository} from "../../repositories/ResourceReadModelRepository";
import {UserIdentity} from "../../../write/domain/entities/UserIdentity";
import {GroupErrors} from "../../../write/domain/errors/GroupErrors";
import {GroupRepository} from "../../../write/domain/repositories/GroupRepository";
import {UserRole} from "../../../write/domain/types/UserRole";
import {UserErrors} from "../../../write/domain/errors/UserErrors";


export interface AdminGetResourceByIdInput {
    user: UserIdentity;
    groupId: string;
    resourceId: string;
    isModule?: boolean;
}

@injectable()
export class AdminGetResourceById implements Query<AdminGetResourceByIdInput, ResourceReadModel> {
    constructor(
        @inject(Identifiers.resourceReadModelRepository)
        private readonly _resourceReadModelRepository: ResourceReadModelRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
    ) {
    }

    async execute(payload: AdminGetResourceByIdInput): Promise<ResourceReadModel> {
        const {groupId, user, resourceId, isModule} = payload;

        const group = await this._groupRepository.getGroupById(groupId, {
            isModule: isModule ? isModule : false
        });

        if (!group)
            throw new GroupErrors.GroupNotFound(isModule ? "MODULE_NOT_FOUND" : "GROUP_NOT_FOUND");


        if (
            Number(user.role) !== UserRole.ADMIN &&
            Number(user.role) !== UserRole.MODERATOR
        )
            throw new UserErrors.PermissionDenied();

        return await this._resourceReadModelRepository.getResourceById({
            groupId,
            resourceId
        });
    }
}