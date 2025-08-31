import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {LiveStatus} from "../../domain/types/LiveStatus";
import {Live} from "../../domain/aggregates/Live";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {Identifiers} from "../../../Identifiers";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {AccessLevel} from "../../domain/types/AccessLevel";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {StorageGateway} from "../../domain/gateway/StorageGateway";
import {LiveErrors} from "../../domain/errors/LiveErrors";
import {LiveCategoryErrors} from "../../domain/errors/LiveCategoryErrors";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {isValidUrl} from "../../domain/utils/Functions";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";

export interface UpdateLiveInput {
    user: UserIdentity,
    live: {
        id: string;
        title: string;
        description: string;
        coverImage: string | null;
        status: LiveStatus;
        airsAt: Date;
        duration: number;
        accessLevel: AccessLevel;
        roomId?: string;
        groupId?: string;
        categoryId: string;
    }
}

@injectable()
export class UpdateLive implements Usecase<UpdateLiveInput, Live> {
    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(Identifiers.liveCategoryRepository)
        private readonly _liveCategoryRepository: LiveCategoryRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
    ) {
    }

    async execute(payload: UpdateLiveInput): Promise<Live> {
        const role: UserRole = payload.user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const category = await this._liveCategoryRepository.getOne(payload.live.categoryId);

        if (!category)
            throw new LiveCategoryErrors.LiveCategoryNotFound();

        payload.live.coverImage = isValidUrl(payload.live.coverImage) ? payload.live.coverImage : await this.storageGateway.getDownloadUrl(payload.live.coverImage)
        const live = await this._liveRepository.getLiveById(payload.live.id);
        if (!live) throw new LiveErrors.LiveNotFound();
        live.updateLive({
            ...payload.live,
            ownerId: payload.user.id,
            roomId: payload.live.roomId
        });
        const newLive = await this._liveRepository.update(payload);
        await this.eventDispatcher.dispatch(live);
        return newLive;
    }

}
