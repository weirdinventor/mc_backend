import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Record} from "../../domain/aggregates/Record";
import {Identifiers} from "../../../Identifiers";
import {RecordRepository} from "../../domain/repositories/RecordRepository";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {RecordStatus} from "../../domain/types/RecordStatus";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {RecordErrors} from "../../domain/errors/RecordErrors";
import {isValidUrl} from "../../domain/utils/Functions";
import {StorageGateway} from "../../domain/gateway/StorageGateway";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";


export interface UpdateRecordInput {
    user: UserIdentity,
    data: {
        id: string;
        title: string;
        description: string;
        thumbnail?: string;
        status: RecordStatus
    }
}

@injectable()
export class UpdateRecord implements Usecase<UpdateRecordInput, Record> {

    constructor(
        @inject(Identifiers.recordRepository) private readonly _recordRepository: RecordRepository,
        @inject(EventDispatcher) private readonly _eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway) private readonly storageGateway: StorageGateway
    ) {
    }

    async execute(payload: UpdateRecordInput): Promise<Record> {
        const {user, data} = payload

        const record = await this._recordRepository.getById(data.id)

        if (!record) {
            throw new RecordErrors.RecordNotFound();
        }

        const role: UserRole = user.role

        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        if (data.thumbnail && !isValidUrl(data.thumbnail)) {
            data.thumbnail = await this.storageGateway.getDownloadUrl(payload.data.thumbnail);
        }

        record.update(data);

        const updatedRecord = await this._recordRepository.update({
            user,
            data
        })

        await this._eventDispatcher.dispatch(record);

        return updatedRecord
    }
}