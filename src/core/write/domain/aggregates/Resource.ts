import {AggregateRoot} from "../entities/AggregateRoot";
import {v4} from "uuid";
import {ResourceCreated} from "../../../../messages/events/resource/ResourceCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {ResourceUpdated} from "../../../../messages/events/resource/ResourceUpdated";
import {ResourceDeleted} from "../../../../messages/events/resource/ResourceDeleted";
import {LiveCategoryEntity} from "../../../../adapters/repositories/entities/LiveCategoryEntity";


export interface ResourceProperties {
    id: string;
    title: string;
    description: string;
    url: string;
    image: string;
    authorId: string;
    groupId: string;
    categoryId?: string;
    category?: LiveCategoryEntity;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Resource extends AggregateRoot<ResourceProperties> {

    static restore(props: ResourceProperties) {
        return new Resource(props);
    }

    static create(
        payload: {
            title: string;
            description: string;
            url: string;
            image: string;
            authorId: string;
            groupId: string;
            categoryId: string;
        }
    ) {
        const resource = new Resource({
            id: v4(),
            ...payload
        });

        resource.applyChange(
            new ResourceCreated({
                title: resource.props.title,
                description: resource.props.description,
                url: resource.props.url,
                image: resource.props.image,
                groupId: resource.props.groupId,
                categoryId: resource.props.categoryId
            })
        );

        return resource;
    }

    @Handle(ResourceCreated)
    private applyResourceCreated(event: ResourceCreated) {
        this.props = {
            ...this.props,
            title: event.props.title,
            description: event.props.description,
            url: event.props.url,
            image: event.props.image,
            groupId: event.props.groupId,
            categoryId: event.props.categoryId
        }
    }


    update(payload: {
        title: string;
        description: string;
        url: string;
        image: string;
        authorId: string;
        groupId: string;
        categoryId: string;
    }) {

        this.applyChange(
            new ResourceUpdated(payload)
        )

        return this
    }

    @Handle(ResourceUpdated)
    private applyResourceUpdated(event: ResourceUpdated) {
        this.props = {
            ...this.props,
            title: event.props.title,
            description: event.props.description,
            url: event.props.url,
            image: event.props.image,
            groupId: event.props.groupId,
            categoryId: event.props.categoryId
        }
    }

    delete(payload: {
        id: string
    }) {

        this.applyChange(
            new ResourceDeleted(payload)
        )

        return this
    }

    @Handle(ResourceDeleted)
    private applyResourceDeleted(event: ResourceDeleted) {
        this.props = {
            ...this.props,
            id: event.props.id
        }
    }
}