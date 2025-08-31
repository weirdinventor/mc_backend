import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {ResourceReadModel} from "../../models/ResourceReadModel";
import {Identifiers} from "../../../Identifiers";
import {ResourceReadModelRepository} from "../../repositories/ResourceReadModelRepository";
import {UserIdentity} from "../../../write/domain/entities/UserIdentity";
import {GroupRepository} from "../../../write/domain/repositories/GroupRepository";
import {GroupErrors} from "../../../write/domain/errors/GroupErrors";
import {UserRole} from "../../../write/domain/types/UserRole";
import {ModuleErrors} from "../../../write/domain/errors/ModuleErrors";
import {UserErrors} from "../../../write/domain/errors/UserErrors";


export interface GetGroupResourcesInput {
    user: UserIdentity;
    groupId: string;
}

@injectable()
export class GetGroupResources implements Query<GetGroupResourcesInput, ResourceReadModel[]> {
    constructor(
        @inject(Identifiers.resourceReadModelRepository)
        private readonly _resourceReadModelRepository: ResourceReadModelRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
    ) {
    }

    async execute(payload: GetGroupResourcesInput): Promise<ResourceReadModel[]> {
        const {groupId, user} = payload;

        const group = await this._groupRepository.getGroupOrModuleById(groupId);

        if (!group)
            throw new GroupErrors.GroupNotFound("GROUP_OR_MODULE_NOT_FOUND");

        if (group.props.isModule) {
            const isMember = await this._groupRepository.isUserMemberOfGroup({
                groupId,
                userId: user.id
            });

            if (!isMember)
                throw new ModuleErrors.ModuleNotOwned();
        }

        if (!payload.user.isSubscribed) {
            throw new UserErrors.UserNotSubscribed()
        }

        return await this._resourceReadModelRepository.getResources({
            groupId
        });
    }
}