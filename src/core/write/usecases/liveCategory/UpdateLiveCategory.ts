import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {LiveCategory} from "../../domain/aggregates/LiveCategory";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {LiveCategoryErrors} from "../../domain/errors/LiveCategoryErrors";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";


export interface UpdateLiveCategoryInput {
    user: UserIdentity;
    category: {
        id: string;
        name: string;
    };
}

@injectable()
export class UpdateLiveCategory implements Usecase<UpdateLiveCategoryInput, LiveCategory> {

    constructor(
        @inject(Identifiers.liveCategoryRepository)
        private readonly liveCategoryRepository: LiveCategoryRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: UpdateLiveCategoryInput): Promise<LiveCategory> {
        const {category, user} = payload

        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const selectedCategory = await this.liveCategoryRepository.getOne(category.id)

        if (!selectedCategory) {
            throw new LiveCategoryErrors.LiveCategoryNotFound()
        }

        const updatedCategory = this.liveCategoryRepository.update({
            id: category.id,
            name: category.name
        })

        selectedCategory.updateLiveCategory({
            id: category.id,
            name: category.name
        })

        await this.eventDispatcher.dispatch(selectedCategory)

        return updatedCategory
    }

}