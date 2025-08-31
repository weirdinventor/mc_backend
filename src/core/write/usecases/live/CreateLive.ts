import {inject, injectable} from "inversify";
import {Usecase} from "../../domain/models/Usecase";
import {Live} from "../../domain/aggregates/Live";
import {Identifiers} from "../../../Identifiers";
import {LiveRepository} from "../../domain/repositories/LiveRepository";
import {EventDispatcher} from "../../../../adapters/services/EventDispatcher";
import {AccessLevel} from "../../domain/types/AccessLevel";
import {UserIdentity} from "../../domain/entities/UserIdentity";
import {StorageGateway} from "../../domain/gateway/StorageGateway";
import {LiveCategoryRepository} from "../../domain/repositories/LiveCategoryRepository";
import {LiveCategoryErrors} from "../../domain/errors/LiveCategoryErrors";
import {UserRole} from "../../domain/types/UserRole";
import {UserErrors} from "../../domain/errors/UserErrors";
import {GroupRepository} from "../../domain/repositories/GroupRepository";
import {GroupErrors} from "../../domain/errors/GroupErrors";
import {StreamingGateway} from "../../domain/gateway/StreamingGateway";

export interface CreateLiveInput {
    user: UserIdentity,
    live: {
        title: string;
        description: string;
        coverImage: string | null;
        airsAt: Date | null;
        duration: number;
        accessLevel: AccessLevel;
        roomId?: string;
        categoryId: string
        groupId?: string
    },
    isModule: boolean
}

@injectable()
export class CreateLive implements Usecase<CreateLiveInput, Live> {
    constructor(
        @inject(Identifiers.liveRepository)
        private readonly _liveRepository: LiveRepository,
        @inject(Identifiers.liveCategoryRepository)
        private readonly _liveCategoryRepository: LiveCategoryRepository,
        @inject(EventDispatcher)
        private readonly eventDispatcher: EventDispatcher,
        @inject(Identifiers.storageGateway)
        private readonly storageGateway: StorageGateway,
        @inject(Identifiers.streamingGateway)
        private readonly _streamingGateway: StreamingGateway,
        @inject(Identifiers.groupRepository)
        private readonly _groupRepository: GroupRepository
    ) {
    }

    async execute(payload: CreateLiveInput): Promise<Live> {
        const role: UserRole = payload.user.role
        if (Number(role) !== UserRole.ADMIN && Number(role) !== UserRole.MODERATOR)
            throw new UserErrors.PermissionDenied();

        const category = await this._liveCategoryRepository.getOne(payload.live.categoryId);

        if (!category)
            throw new LiveCategoryErrors.LiveCategoryNotFound();

        if (payload.live.groupId) {
            const group = await this._groupRepository.getGroupById(payload.live.groupId, {
                isModule: payload.isModule
            });

            if (!group) {
                throw new GroupErrors.GroupNotFound(payload.isModule ? "MODULE_NOT_FOUND" : "GROUP_NOT_FOUND");
            }
        }


        payload.live.coverImage = await this.storageGateway.getDownloadUrl(payload.live.coverImage)

        const live = Live.createLive({
            ...payload.live,
            ownerId: payload.user.id
        });

        const newLive = await this._liveRepository.save(live);

        live.createRoom({
            id: newLive.id,
            duration: newLive.props.duration
        })

        const room = await this._streamingGateway.createRoom({
            user: payload.user,
            id: newLive.id,
            duration: newLive.props.duration,
            autoCloseConfig: "session-end-and-deactivate",
            hlsConfigMode: "video-and-audio"
        })

        const updatedLive = await this._liveRepository.update({
            user: payload.user,
            live: {
                ...newLive.props,
                categoryId: category.id,
                roomId: room.roomId,
                groupId: payload.live.groupId
            }
        });
        await this.eventDispatcher.dispatch(live);

        return updatedLive;
    }
}
