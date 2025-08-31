import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {ResourceRepository} from "../../domain/repositories/ResourceRepository";
import {ResourceErrors} from "../../domain/errors/ResourceErrors";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {UserRole} from "../../domain/types/UserRole";


export interface DeleteResourceInput {
    user: UserIdentity;
    resourceId: string;
    groupId: string;
    isModule?: boolean
}

@injectable()
export class DeleteResource implements Usecase<DeleteResourceInput, void> {


    constructor(
        @inject(Identifiers.resourceRepository)
        private readonly _resourceRepository: ResourceRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: DeleteResourceInput): Promise<void> {
        const {user, resourceId, groupId, isModule} = payload;

        const resource = await this._resourceRepository.getById(resourceId);

        if (!resource)
            throw new ResourceErrors.ResourceNotFound();

        const group = await this._groupRepository.getGroupById(groupId, {
            isModule: isModule ? isModule : false
        });

        if (!group)
            throw new GroupErrors.GroupNotFound(isModule ? "MODULE_NOT_FOUND" : "GROUP_NOT_FOUND");


        const isResourceInGroup = await this._resourceRepository.resourceInGroup({
            groupId,
            resourceId
        });

        if (!isResourceInGroup)
            throw new ResourceErrors.ResourceNotFoundInGroup();

        const isMember = await this._groupRepository.isUserMemberOfGroup({
            groupId: groupId,
            userId: user.id
        });

        if (Number(user.role) !== UserRole.ADMIN && !isMember)
            throw new GroupErrors.GroupMemberNotFound("ONLY_MEMBERS_CAN_DELETE_RESOURCE");

        resource.delete({
            id: resourceId,
        })

        await this._resourceRepository.delete(payload);
        await this._eventDispatcher.dispatch(resource);
    }
}