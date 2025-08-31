import {Resource} from "../aggregates/Resource";
import {UpdateResourceInput} from "../../usecases/resource/UpdateResource";
import {DeleteResourceInput} from "../../usecases/resource/DeleteResource";


export interface ResourceRepository {
    getById(id: string): Promise<Resource>

    resourceInGroup(payload: {
        groupId: string,
        resourceId: string
    }): Promise<boolean>

    create(payload: Resource): Promise<Resource>

    update(payload: UpdateResourceInput): Promise<Resource>

    delete(payload: DeleteResourceInput): Promise<void>
}