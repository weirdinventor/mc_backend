import {v4} from "uuid";
import {NotificationEntity} from "../../../../adapters/repositories/entities/NotificationEntity";
import {UserEntity} from "../../../../adapters/repositories/entities/UserEntity";
import {AggregateRoot} from "../entities/AggregateRoot";
import {LiveStatus} from "../types/LiveStatus";
import {LiveCreated} from "../../../../messages/events/live/LiveCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {LiveUpdated} from "../../../../messages/events/live/LiveUpdated";
import {LiveDeleted} from "../../../../messages/events/live/LiveDeleted";
import {LiveCanceled} from "../../../../messages/events/live/LiveCanceled";
import {LivePublished} from "../../../../messages/events/live/LivePublished";
import {AccessLevel} from "../types/AccessLevel";
import {LiveOngoing} from "../../../../messages/events/live/LiveOngoing";
import {LiveCategoryEntity} from "../../../../adapters/repositories/entities/LiveCategoryEntity";
import {RoomCreated} from "../../../../messages/events/live/RoomCreated";
import {HlsStreamStarted} from "../../../../messages/events/live/HlsStreamStarted";
import {HlsStreamStopped} from "../../../../messages/events/live/HlsStreamStopped";
import {HlsStreamJoined} from "../../../../messages/events/live/HlsStreamJoined";
import {UserInterestedInLive} from "../../../../messages/events/live/UserInterestedInLive";
import {GroupEntity} from "../../../../adapters/repositories/entities/GroupEntity";
import {Record} from "./Record";
import {RecordEntity} from "../../../../adapters/repositories/entities/RecordEntity";

export interface LiveProperties {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    status: LiveStatus;
    duration: number;
    accessLevel: AccessLevel;
    airsAt: Date;
    canceledAt: Date;
    ownerId: string;
    roomId?: string;
    owner?: UserEntity;
    categoryId: string;
    category?: LiveCategoryEntity;
    group?: GroupEntity;
    groupId?: string;
    notifications: NotificationEntity[];
    moderators: UserEntity[];
    interestedUsers: UserEntity[];
    record?: RecordEntity;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Live extends AggregateRoot<LiveProperties> {
    static restore(props: LiveProperties) {
        return new Live(props);
    }

    static createLive(payload: {
        title: string;
        description: string;
        coverImage: string | null;
        airsAt: Date | null;
        duration: number;
        accessLevel: AccessLevel;
        ownerId: string;
        categoryId: string;
        roomId?: string;
        groupId?: string;
    }) {
        const {
            title,
            description,
            coverImage,
            duration,
            accessLevel,
            airsAt,
            ownerId,
            roomId,
            categoryId,
            groupId
        } = payload;
        const live = new Live({
            id: v4(),
            title,
            description,
            airsAt,
            canceledAt: null,
            status: LiveStatus.DRAFT,
            duration,
            accessLevel,
            ownerId,
            coverImage,
            roomId,
            categoryId,
            groupId,
            moderators: [],
            notifications: [],
            interestedUsers: [],
        });

        live.applyChange(
            new LiveCreated({
                title: live.props.title,
                description: live.props.description,
                coverImage: live.props.coverImage,
                status: live.props.status,
                airsAt: live.props.airsAt,
                duration: live.props.duration,
                accessLevel: live.props.accessLevel,
                roomId: live.props.roomId,
                ownerId: live.props.ownerId,
                categoryId: live.props.categoryId,
                groupId: live.props.groupId
            })
        );

        return live;
    }

    @Handle(LiveCreated)
    private applyLiveCreated(event: LiveCreated) {
        this.props.title = event.props.title;
        this.props.description = event.props.description;
        this.props.coverImage = event.props.coverImage;
        this.props.airsAt = event.props.airsAt;
        this.props.status = LiveStatus.DRAFT;
        this.props.duration = event.props.duration;
        this.props.accessLevel = event.props.accessLevel;
        this.props.ownerId = event.props.ownerId;
        this.props.roomId = event.props.roomId;
        this.props.categoryId = event.props.categoryId;
        this.props.groupId = event.props.groupId;
    }

    updateLive(payload: {
        id: string;
        title: string;
        description: string;
        coverImage: string | null;
        status: LiveStatus;
        duration: number;
        ownerId: string;
        accessLevel: AccessLevel;
        airsAt: Date;
        roomId: string;
        categoryId: string;
    }) {
        const {
            id,
            title,
            description,
            coverImage,
            status,
            duration,
            accessLevel,
            airsAt,
            ownerId,
            roomId,
            categoryId
        } = payload;

        this.applyChange(
            new LiveUpdated({
                id: id,
                title: title,
                description: description,
                coverImage: coverImage,
                airsAt: airsAt,
                status: status,
                duration: duration,
                accessLevel: accessLevel,
                ownerId: ownerId,
                roomId,
                categoryId
            })
        );

        return this;
    }

    @Handle(LiveUpdated)
    private applyLiveUpdated(event: LiveUpdated) {
        this.props.title = event.props.title;
        this.props.description = event.props.description;
        this.props.coverImage = event.props.coverImage;
        this.props.airsAt = event.props.airsAt;
        this.props.status = event.props.status;
        this.props.duration = event.props.duration;
        this.props.accessLevel = event.props.accessLevel;
        this.props.ownerId = event.props.ownerId;
        this.props.roomId = event.props.roomId;
        this.props.categoryId = event.props.categoryId;
    }

    deleteLive(payload: { id: string }) {
        const {id} = payload;

        this.applyChange(new LiveDeleted({id}));

        return this;
    }

    @Handle(LiveDeleted)
    private applyLiveDeleted(event: LiveDeleted) {
        this.props.id = event.props.id;
    }

    cancelLive(payload: { id: string }) {
        const {id} = payload;

        this.applyChange(new LiveCanceled({id}));

        return this;
    }

    @Handle(LiveCanceled)
    private applyLiveCanceled(event: LiveCanceled) {
        this.props.id = event.props.id;
    }

    publishLive(payload: { id: string }) {
        const {id} = payload;

        this.applyChange(new LivePublished({id}));

        return this;
    }

    @Handle(LivePublished)
    private applyLivePublished(event: LivePublished) {
        this.props.id = event.props.id;
    }


    markLiveAsOngoing(payload: { id: string }) {
        const {id} = payload;

        this.applyChange(new LiveOngoing({id}))

        return this;
    }

    @Handle(LiveOngoing)
    private applyMarkLiveAsOngoing(event: LiveOngoing) {
        this.props.id = event.props.id;
    }

    createRoom(payload: { id: string, duration: number }) {

        this.applyChange(
            new RoomCreated(payload)
        )

        return this;
    }

    @Handle(RoomCreated)
    private applyCreateRoom(event: RoomCreated) {
        this.props.id = event.props.id;
        this.props.duration = event.props.duration;
    }

    startHlsStream(payload: { id: string }) {
        const {id} = payload;

        this.applyChange(
            new HlsStreamStarted({
                id
            })
        )

        return this
    }

    @Handle(HlsStreamStarted)
    private applyStartHlsStream(event: HlsStreamStarted) {
        this.props.id = event.props.id;
    }

    stopHlsStream(payload: { id: string }) {
        const {id} = payload;

        this.applyChange(
            new HlsStreamStopped({
                id
            })
        )

        return this
    }

    @Handle(HlsStreamStopped)
    private applyStopHlsStream(event: HlsStreamStopped) {
        this.props.id = event.props.id;
    }

    joinHlsStream(payload: { id: string }) {
        const {id} = payload;

        this.applyChange(
            new HlsStreamJoined({
                id
            })
        )

        return this
    }

    @Handle(HlsStreamJoined)
    private applyJoinHlsStream(event: HlsStreamJoined) {
        this.props.id = event.props.id;
    }

    userInterestAdded(payload: {
        id: string;
    }) {
        const {id} = payload;
        this.applyChange((
            new UserInterestedInLive({
                id
            })
        ))

        return this;
    }

    @Handle(UserInterestedInLive)
    private applyUserInterestAdded(event: UserInterestedInLive) {
        this.props.id = event.props.id;
    }

}
