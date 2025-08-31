import {RecordStatus} from "../../write/domain/types/RecordStatus";
import {PersonalInformationReadModel} from "./PersonalInformationReadModel";
import {AccessLevel} from "../../write/domain/types/AccessLevel";
import {LiveCategoryProperties} from "../../write/domain/aggregates/LiveCategory";
import {GroupProperties} from "../../write/domain/aggregates/Group";


export interface RecordReadModel {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    status: RecordStatus;
    fileUrl: string;
    accessLevel: AccessLevel;
    owner: PersonalInformationReadModel;
    group: GroupProperties;
    category?: LiveCategoryProperties;
    createdAt?: Date;
    updatedAt?: Date;
}