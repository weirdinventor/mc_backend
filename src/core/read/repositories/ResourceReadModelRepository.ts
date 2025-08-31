import {ResourceReadModel} from "../models/ResourceReadModel";


export interface ResourceReadModelRepository {
    getResources(payload: {
        groupId: string;
    }): Promise<ResourceReadModel[]>;

    getResourceById(payload: {
        resourceId: string;
        groupId: string;
    }): Promise<ResourceReadModel>;
}