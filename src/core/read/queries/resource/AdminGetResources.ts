import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {ResourceReadModel} from "../../models/ResourceReadModel";
import {Identifiers} from "../../../Identifiers";
import {ResourceReadModelRepository} from "../../repositories/ResourceReadModelRepository";
import {UserIdentity} from "../../../write/domain/entities/UserIdentity";
import {GroupRepository} from "../../../write/domain/repositories/GroupRepository";
import {GroupErrors} from "../../../write/domain/errors/GroupErrors";
import {UserErrors} from "../../../write/domain/errors/UserErrors";
import {UserRole} from "../../../write/domain/types/UserRole";


export interface AdminGetResourcesInput {
    user: UserIdentity;
    groupId: string;
    isModule?: boolean;
}

@injectable()
export class AdminGetResources implements Query<AdminGetResourcesInput, ResourceReadModel[]> {
    constructor(
        @inject(Identifiers.resourceReadModelRepository)
        private readonly _resourceReadModelRepository: ResourceReadModelRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
    ) {
    }

    async execute(payload: AdminGetResourcesInput): Promise<ResourceReadModel[]> {
        const {groupId, user, isModule} = payload;

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

        return await this._resourceReadModelRepository.getResources({
            groupId
        });
    }
}