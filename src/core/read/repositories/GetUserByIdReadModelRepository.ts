import {GetUserByIdReadModel} from "../models/GetUserByIdReadModel";


export interface GetUserByIdReadModelRepository {
    getById(id: string): Promise<GetUserByIdReadModel>;
}