import {Record} from "../../domain/aggregates/Record";
import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {LiveErrors} from "../../domain/errors/LiveErrors";


export interface SaveRecordInput {
    roomId: string;
    record: Record;
}

@injectable()
export class SaveRecord implements Usecase<SaveRecordInput, void> {

    constructor(
        @inject(Identifiers.liveRepository)
        private _liveRepository: LiveRepository,
    ) {
    }

    async execute(payload: SaveRecordInput): Promise<void> {
        const {record, roomId} = payload;

        const live = await this._liveRepository.getLiveByRoomId(roomId);

        if (!live) {
            throw new LiveErrors.LiveNotFound();
        }

        await this._liveRepository.saveRecord({
            roomId,
            record
        });
    }

}