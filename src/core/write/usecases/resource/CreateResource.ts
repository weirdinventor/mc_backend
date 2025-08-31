import {UserIdentity} from "../../domain/entities/UserIdentity";
import {Usecase} from "../../domain/models/Usecase";
import {Resource} from "../../domain/aggregates/Resource";
import {inject, injectable} from "inversify";
import {ResourceRepository} from "../../domain/repositories/ResourceRepository";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {StorageGateway} from "../../domain/gateway/StorageGateway";
import {LiveCategoryErrors} from "../../domain/errors/LiveCategoryErrors";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {UserRole} from "../../domain/types/UserRole";


export interface CreateResourceInput {
    user: UserIdentity,
    data: {
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
export class CreateResource implements Usecase<CreateResourceInput, Resource> {

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


    async execute(payload: CreateResourceInput): Promise<Resource> {
        const {data, user} = payload;

        const group = await this._groupRepository.getGroupById(data.groupId, {
            isModule: data.isModule ? data.isModule : false
        });

        if (!group)
            throw new GroupErrors.GroupNotFound(data.isModule ? "MODULE_NOT_FOUND" : "GROUP_NOT_FOUND");

        const category = await this._liveCategoryRepository.getOne(data.categoryId);

        if (!category)
            throw new LiveCategoryErrors.LiveCategoryNotFound();

        const isMember = await this._groupRepository.isUserMemberOfGroup({
            userId: user.id,
            groupId: data.groupId
        })

        if (Number(user.role) !== UserRole.ADMIN && !isMember)
            throw new GroupErrors.GroupMemberNotFound("ONLY_GROUP_MEMBER_CAN_CREATE_RESOURCE");


        data.image = await this._storageGateway.getDownloadUrl(data.image);

        const resource = Resource.create({
            ...data,
            authorId: user.id
        });

        const savedResource = this._resourceRepository.create(resource);
        await this._eventDispatcher.dispatch(resource);
        return savedResource;
    }
}