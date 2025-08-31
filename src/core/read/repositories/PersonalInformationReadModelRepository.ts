import {PersonalInformationReadModel} from "../models/PersonalInformationReadModel";

export interface PersonalInformationReadModelRepository {
    getById(id: string): Promise<PersonalInformationReadModel>;

    getAllUsers(payload: {
        subscribed?: boolean,
        take?: number,
        skip?: number
    }): Promise<{
        users: PersonalInformationReadModel[];
        total: number;
    }>
}