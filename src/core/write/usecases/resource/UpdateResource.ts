import {UserIdentity} from "../../domain/entities/UserIdentity";
import {Usecase} from "../../domain/models/Usecase";
import {Resource} from "../../domain/aggregates/Resource";
import {Identifiers} from "../../../Identifiers";
import {ResourceRepository} from "../../domain/repositories/ResourceRepository";
import {inject, injectable} from "inversify";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {ResourceErrors} from "../../domain/errors/ResourceErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {StorageGateway} from "../../domain/gateway/StorageGateway";
import {isValidUrl} from "../../domain/utils/Functions";
import {LiveCategoryErrors} from "../../domain/errors/LiveCategoryErrors";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {UserRole} from "../../domain/types/UserRole";

export interface UpdateResourceInput {
    user: UserIdentity,
    resourceId: string;
    resource: {
        title: string;
        description: string;
        url: string;
        image: string;
        groupId: string;
        categoryId: string;
        isModule?: boolean;
    }
}


@injectable()
export class UpdateResource implements Usecase<UpdateResourceInput, Resource> {

    constructor(
        @inject(Identifiers.resourceRepository)
        private readonly _resourceRepository: ResourceRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly _storageGateway: StorageGateway,
        @inject(Identifiers.liveCategoryRepository)
        private readonly _liveCategoryRepository: LiveCategoryRepository
    ) {
    }

    async execute(payload: UpdateResourceInput): Promise<Resource> {
        const {user, resourceId, resource} = payload;


        const res = await this._resourceRepository.getById(resourceId);

        if (!res)
            throw new ResourceErrors.ResourceNotFound();

        const group = await this._groupRepository.getGroupById(resource.groupId, {
            isModule: resource.isModule ? resource.isModule : false
        });

        if (!group)
            throw new GroupErrors.GroupNotFound(resource.isModule ? "MODULE_NOT_FOUND" : "GROUP_NOT_FOUND");

        const category = await this._liveCategoryRepository.getOne(resource.categoryId);

        if (!category)
            throw new LiveCategoryErrors.LiveCategoryNotFound();

        const isResourceInGroup = await this._resourceRepository.resourceInGroup({
            groupId: resource.groupId,
            resourceId
        });

        if (!isResourceInGroup)
            throw new ResourceErrors.ResourceNotFoundInGroup();

        const isMember = await this._groupRepository.isUserMemberOfGroup({
            groupId: resource.groupId,
            userId: user.id
        });

        if (Number(user.role) !== UserRole.ADMIN && !isMember)
            throw new GroupErrors.GroupMemberNotFound("ONLY_GROUP_MEMBER_CAN_UPDATE_RESOURCE");

        resource.image = isValidUrl(resource.image) ?
            resource.image :
            await this._storageGateway.getDownloadUrl(resource.image);

        res.update({
            ...resource,
            authorId: user.id
        });

        const updatedResource = await this._resourceRepository.update(payload);
        await this._eventDispatcher.dispatch(res);
        return updatedResource;
    }

}