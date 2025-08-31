import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Record} from "../../domain/aggregates/Record";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {LiveErrors} from "../../domain/errors/LiveErrors";


export interface GetLiveRecordsInput {
    liveId: string;
}

@injectable()
export class GetLiveRecords implements Usecase<GetLiveRecordsInput, Record> {

    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository
    ) {
    }

    async execute(payload: GetLiveRecordsInput): Promise<Record> {

        const live = await this._liveRepository.getLiveById(payload.liveId);

        if (!live) {
            throw new LiveErrors.LiveNotFound();
        }

        return await this._liveRepository.getLiveRecord(payload.liveId);
    }
}