import {UserIdentity} from "../../domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {LiveCategoryErrors} from "../../domain/errors/LiveCategoryErrors";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";


export interface DeleteLiveCategoryInput {
    user: UserIdentity;
    id: string;
}

@injectable()
export class DeleteLiveCategory implements Usecase<DeleteLiveCategoryInput, void> {

    constructor(
        @inject(Identifiers.liveCategoryRepository)
        private readonly liveCategoryRepository: LiveCategoryRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: DeleteLiveCategoryInput): Promise<void> {
        const {user, id} = payload;

        const role: UserRole = user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const category = await this.liveCategoryRepository.getOne(id);

        if (!category) throw new LiveCategoryErrors.LiveCategoryNotFound();

        await this.liveCategoryRepository.delete(id);

        category.deleteLiveCategory({
            id
        })

        await this.eventDispatcher.dispatch(category);
    }
}