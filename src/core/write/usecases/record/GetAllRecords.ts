import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Record} from "../../domain/aggregates/Record";
import {Identifiers} from "../../../Identifiers";
import {RecordRepository} from "../../domain/repositories/RecordRepository";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";


export interface GetAllRecordsInput {
    user: UserIdentity
    groupId?: string;
}

@injectable()
export class GetAllRecords implements Usecase<GetAllRecordsInput, Record[]> {

    constructor(
        @inject(Identifiers.recordRepository)
        private readonly _recordRepository: RecordRepository
    ) {
    }


    async execute(payload: GetAllRecordsInput): Promise<Record[]> {
        const {user} = payload;
        const role: UserRole = user.role

        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        return await this._recordRepository.getAll(payload);
    }
}