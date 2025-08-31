import {RecordReadModel} from "../models/RecordReadModel";
import {GetPublishedRecordsReadModelInput} from "../queries/record/GetPublishedRecords";
import {GetRecordByIdInput} from "../queries/record/GetRecordById";


export interface RecordReadModelRepository {
    getRecordById(payload: GetRecordByIdInput): Promise<RecordReadModel>;

    getPublishedRecords(payload: GetPublishedRecordsReadModelInput, isModule?: boolean): Promise<RecordReadModel[]>;
}