import {CreateCategoryPayload} from "../../usecases/liveCategory/CreateLiveCategory";
import {LiveCategory} from "../aggregates/LiveCategory";

export interface LiveCategoryRepository {
    getOne(id: string): Promise<LiveCategory>

    getAll(): Promise<LiveCategory[]>

    create(payload: LiveCategory): Promise<LiveCategory>

    update(payload: { id: string, name: string }): Promise<LiveCategory>

    delete(id: string): Promise<void>
}