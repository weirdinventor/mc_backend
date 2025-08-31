import {Record} from "../aggregates/Record";
import {UpdateRecordInput} from "../../usecases/record/UpdateRecord";
import {GetAllRecordsInput} from "../../usecases/record/GetAllRecords";

export interface RecordRepository {
    getById(id: string): Promise<Record>;

    getAll(payload: GetAllRecordsInput): Promise<Record[]>;

    create(record: Record): Promise<Record>;

    update(payload: UpdateRecordInput): Promise<Record>;
}