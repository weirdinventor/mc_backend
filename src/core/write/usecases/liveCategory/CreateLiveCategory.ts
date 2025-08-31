import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {LiveCategory} from "../../domain/aggregates/LiveCategory";
import {Usecase} from "../../domain/models/Usecase";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {Identifiers} from "../../../Identifiers";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";


export interface CreateCategoryPayload {
    user: UserIdentity;
    name: string;
}

@injectable()
export class CreateLiveCategory implements Usecase<CreateCategoryPayload, LiveCategory> {

    constructor(
        @inject(Identifiers.liveCategoryRepository)
        private readonly liveCategoryRepository: LiveCategoryRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: CreateCategoryPayload): Promise<LiveCategory> {
        const {user, name} = payload;

        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const liveCategory = LiveCategory.createLiveCategory({
            name
        });

        const category = await this.liveCategoryRepository.create(liveCategory);
        await this.eventDispatcher.dispatch(liveCategory);

        return category;
    }
}