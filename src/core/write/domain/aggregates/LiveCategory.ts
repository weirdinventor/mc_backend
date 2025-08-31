import {AggregateRoot} from "../entities/AggregateRoot";
import {v4} from "uuid";
import {LiveCategoryCreated} from "../../../../messages/events/liveCategory/LiveCategoryCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {LiveCategoryDeleted} from "../../../../messages/events/liveCategory/LiveCategoryDeleted";
import {LiveCategoryUpdated} from "../../../../messages/events/liveCategory/LiveCategoryUpdated";

export interface LiveCategoryProperties {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}


export class LiveCategory extends AggregateRoot<LiveCategoryProperties> {

    static restore(props: LiveCategoryProperties) {
        return new LiveCategory(props);
    }

    static createLiveCategory(payload: {
        name: string;
    }): LiveCategory {
        const {name} = payload

        const liveCategory = new LiveCategory({
            id: v4(),
            name
        });

        liveCategory.applyChange(
            new LiveCategoryCreated({
                name
            })
        )

        return liveCategory;
    }

    @Handle(LiveCategoryCreated)
    handleLiveCategoryCreated(event: LiveCategoryCreated) {
        this.props = {
            ...this.props,
            ...event.props
        }
    }

    updateLiveCategory(payload: {
        id: string;
        name: string;
    }): LiveCategory {
        const {id, name} = payload
        this.applyChange(
            new LiveCategoryUpdated({
                id,
                name
            })
        )

        return this;
    }

    @Handle(LiveCategoryUpdated)
    handleLiveCategoryUpdated(event: LiveCategoryUpdated) {
        this.props = {
            ...this.props,
            ...event.props
        }
    }

    deleteLiveCategory(payload: {
        id: string;
    }): LiveCategory {
        const {id} = payload
        this.applyChange(
            new LiveCategoryDeleted({
                id
            })
        )
        return this;
    }

    @Handle(LiveCategoryDeleted)
    handleLiveCategoryDeleted(event: LiveCategoryDeleted) {
        this.props = {
            ...this.props,
            ...event.props
        }
    }
}