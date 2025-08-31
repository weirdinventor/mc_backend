import {inject, injectable} from "inversify";
import {Query} from "../../../write/domain/models/Query";
import {LiveReadModel} from "../../models/LiveReadModel";
import {Identifiers} from "../../../Identifiers";
import {LivesReadModelRepository} from "../../repositories/GetLivesReadModelRepository";
import {LiveTimeframe} from "../../../write/domain/types/LiveTimeframe";
import {UserIdentity} from "../../../write/domain/entities/UserIdentity";
import {GroupRepository} from "../../../write/domain/repositories/GroupRepository";
import {GroupErrors} from "../../../write/domain/errors/GroupErrors";
import {ModuleErrors} from "../../../write/domain/errors/ModuleErrors";
import {UserErrors} from "../../../write/domain/errors/UserErrors";

export interface GetLivesByTimeframeInput {
    user: UserIdentity;
    timeframe: LiveTimeframe;
    groupId?: string;
}

@injectable()
export class GetLivesByTimeframe implements Query<GetLivesByTimeframeInput, LiveReadModel[]> {

    constructor(
        @inject(Identifiers.livesReadModelRepository)
        private readonly _getLivesReadModelRepository: LivesReadModelRepository,
        @inject(Identifiers.groupRepository) private readonly _groupRepository: GroupRepository
    ) {
    }

    async execute(payload: GetLivesByTimeframeInput): Promise<LiveReadModel[]> {

        if (!payload.groupId) {
            return await this._getLivesReadModelRepository.getLivesByTimeframe(payload);
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
            return await this._getLivesReadModelRepository.getLivesByTimeframe(payload, group.props.isModule);

        } else {
            if (!payload.user.isSubscribed) {
                throw new UserErrors.UserNotSubscribed()
            }
            return await this._getLivesReadModelRepository.getLivesByTimeframe(payload);
        }
    }
}