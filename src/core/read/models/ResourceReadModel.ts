import {PersonalInformationReadModel} from "./PersonalInformationReadModel";
import {LiveCategoryEntity} from "../../../adapters/repositories/entities/LiveCategoryEntity";

export interface ResourceReadModel {
    id: string;
    title: string;
    description: string;
    url: string;
    image: string;
    author: PersonalInformationReadModel;
    groupId: string;
    category?: LiveCategoryEntity;
    createdAt?: Date;
    updatedAt?: Date;
}