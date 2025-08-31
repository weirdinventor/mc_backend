import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {LiveCategory} from "../../domain/aggregates/LiveCategory";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {Identifiers} from "../../../Identifiers";


@injectable()
export class GetLiveCategories implements Usecase<void, LiveCategory[]> {


    constructor(
        @inject(Identifiers.liveCategoryRepository)
        private readonly _liveCategoryRepository: LiveCategoryRepository
    ) {
    }

    async execute(): Promise<LiveCategory[]> {
        return await this._liveCategoryRepository.getAll();
    }
}