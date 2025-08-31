import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Record} from "../../domain/aggregates/Record";
import {Identifiers} from "../../../Identifiers";
import {RecordRepository} from "../../domain/repositories/RecordRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";


export interface CreateRecordInput {
    fileUrl: string;
}

@injectable()
export class CreateRecord implements Usecase<CreateRecordInput, Record> {

    constructor(
        @inject(Identifiers.recordRepository)
        private readonly _recordRepository: RecordRepository,
        @inject(EventDispatcher)
        private readonly _eventDispatcher: EventDispatcher
    ) {
    }

    async execute(payload: CreateRecordInput): Promise<Record> {

        const record = Record.create({
            fileUrl: payload.fileUrl
        })

        const createdRecord = await this._recordRepository.create(record);
        await this._eventDispatcher.dispatch(record);
        return createdRecord;
    }
}