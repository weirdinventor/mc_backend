import {UserIdentity} from "../../../write/domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {RecordReadModel} from "../../models/RecordReadModel";
import {RecordReadModelRepository} from "../../repositories/RecordReadModelRepository";
import {Identifiers} from "../../../Identifiers";
import {RecordRepository} from "../../../write/domain/repositories/RecordRepository";
import {RecordErrors} from "../../../write/domain/errors/RecordErrors";


export interface GetRecordByIdInput {
    user: UserIdentity;
    id: string;
    isModule?: boolean;
}


@injectable()
export class GetRecordById implements Query<GetRecordByIdInput, RecordReadModel> {

    constructor(
        @inject(Identifiers.recordReadModelRepository)
        private readonly _recordReadModelRepository: RecordReadModelRepository,
        @inject(Identifiers.recordRepository)
        private readonly _recordRepository: RecordRepository,
    ) {
    }

    async execute(payload: GetRecordByIdInput): Promise<RecordReadModel> {
        const record = await this._recordRepository.getById(payload.id);

        if (!record) {
            throw new RecordErrors.RecordNotFound();
        }

        return await this._recordReadModelRepository.getRecordById(payload);
    }
}