import {UserIdentity} from "../../../write/domain/entities/UserIdentity";
import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {RecordReadModel} from "../../models/RecordReadModel";
import {RecordReadModelRepository} from "../../repositories/RecordReadModelRepository";
import {Identifiers} from "../../../Identifiers";
import {GroupRepository} from "../../../write/domain/repositories/GroupRepository";
import {GroupErrors} from "../../../write/domain/errors/GroupErrors";
import {ModuleErrors} from "../../../write/domain/errors/ModuleErrors";
import {UserErrors} from "../../../write/domain/errors/UserErrors";
import {GroupReadModelRepository} from "../../repositories/GroupReadModelRepository";


export interface GetPublishedRecordsReadModelInput {
    user: UserIdentity;
    groupId?: string;
}


@injectable()
export class GetPublishedRecords implements Query<GetPublishedRecordsReadModelInput, RecordReadModel[]> {

    constructor(
        @inject(Identifiers.recordReadModelRepository)
        private readonly _recordReadModelRepository: RecordReadModelRepository,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository,
    ) {
    }

    async execute(payload: GetPublishedRecordsReadModelInput): Promise<RecordReadModel[]> {

        if (!payload.groupId) {
            return await this._recordReadModelRepository.getPublishedRecords(payload);
        }
        const group = await this._groupRepository.getGroupOrModuleById(payload.groupId);

        if (!group) {
            throw new GroupErrors.GroupNotFound("GROUP_OR_MODULE_NOT_FOUND");
        }

        if (group.props.isModule) {
            const isMember = await this._groupRepository.isUserMemberOfGroup({
                groupId: group.id,
                userId: payload.user.id
            })

            if (!isMember) {
                throw new ModuleErrors.ModuleNotOwned()
            }
            return await this._recordReadModelRepository.getPublishedRecords(payload, group.props.isModule);

        } else {
            if (!payload.user.isSubscribed) {
                throw new UserErrors.UserNotSubscribed()
            }
            return await this._recordReadModelRepository.getPublishedRecords(payload);
        }

    }
}