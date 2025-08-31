import {EntityManager, MoreThanOrEqual} from "typeorm";
import {Live} from "../../../core/write/domain/aggregates/Live";
import {LiveRepository} from "../../../core/write/domain/repositories/LiveRepository";
import {LiveEntityMapper} from "./mappers/LiveEntityMapper";
import {LiveEntity} from "../entities/LiveEntity";
import {UpdateLiveInput} from "../../../core/write/usecases/live/UpdateLive";
import {LiveStatus} from "../../../core/write/domain/types/LiveStatus";
import {Timeframe} from "../../../core/write/usecases/live/GetLivesByTimeframe";
import {GetLivesByStatusAndDateInput} from "../../../core/write/usecases/live/GetLivesByStatusAndDate";
import {AddUserInterestToLiveInput} from "../../../core/write/usecases/live/AddUserInterestToLive";
import {UserEntity} from "../entities/UserEntity";
import {RemoveUserInterestFromLiveInput} from "../../../core/write/usecases/live/RemoveUserInterestFromLive";
import {Record} from "../../../core/write/domain/aggregates/Record";
import {RecordEntityMapper} from "../record/mappers/RecordEntityMapper";
import {RecordEntity} from "../entities/RecordEntity";

export class PostgresLiveRepository implements LiveRepository {
    private readonly liveEntityMapper: LiveEntityMapper;
    private readonly recordEntityMapper: RecordEntityMapper;

    constructor(private readonly entityManager: EntityManager) {
        this.liveEntityMapper = new LiveEntityMapper(this.entityManager);
        this.recordEntityMapper = new RecordEntityMapper(this.entityManager);
    }

    async getAll(): Promise<Live[]> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const lives = await liveRepo.find({
            where: {
                airsAt: MoreThanOrEqual(new Date()),
                status: LiveStatus.SCHEDULED,
            },
            relations: {
                record: true,
            }
        });
        return lives.map((live) => this.liveEntityMapper.toDomain(live));
    }

    async getLiveById(id: string): Promise<Live> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const live = await liveRepo.findOne({
            where: {
                id,
            },
            relations: {
                record: true,
            }
        });

        if (!live) return null;

        return this.liveEntityMapper.toDomain(live);
    }

    async getLiveByRoomId(roomId: string): Promise<Live> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const live = await liveRepo.findOne({
            where: {
                roomId
            },
            relations: {
                record: true,
            }
        });

        if (!live) return null;

        return this.liveEntityMapper.toDomain(live);
    }

    async getLiveByGroupId(groupId: string): Promise<Live> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const live = await liveRepo.findOne({
            where: {
                groupId
            },
            relations: {
                record: true,
            }
        });

        if (!live) return null;

        return this.liveEntityMapper.toDomain(live);
    }

    async getLiveRecord(liveId: string): Promise<Record> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const live = await liveRepo.findOne({
            where: {
                id: liveId,
            },
            relations: {
                record: true,
                category: true,
            }
        });


        if (!live) return null;


        return this.recordEntityMapper.toDomain(live.record, {
            category: live.category
        });
    }

    async save(live: Live): Promise<Live> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const liveEntity = this.liveEntityMapper.fromDomain(live);
        const savedLive: LiveEntity = await liveRepo.save(liveEntity);
        return this.liveEntityMapper.toDomain(savedLive);
    }

    async update(param: UpdateLiveInput): Promise<Live> {
        const {id} = param.live;
        const liveRepo = this.entityManager.getRepository(LiveEntity);

        const existingLive = await liveRepo.findOne({
            where: {
                id,
            },
            relations: {
                record: true,
                group: true,
            }
        });

        if (!existingLive) return null;

        const updatedLive = await liveRepo.save({
            id: existingLive.id,
            ...existingLive,
            groupId: param.live.groupId ? param.live.groupId : null,
            roomId: param.live.roomId ? param.live.roomId : null,
        });

        return this.liveEntityMapper.toDomain(updatedLive);
    }

    async delete(id: string): Promise<void> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        await liveRepo.delete(id);
    }

    async cancel(id: string): Promise<Live> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        await liveRepo.update(id, {
            status: LiveStatus.CANCELED,
            canceledAt: new Date(),
        });

        const canceledLive = await liveRepo.findOne({
            where: {
                id,
            },
        });

        if (!canceledLive) return null;

        return this.liveEntityMapper.toDomain(canceledLive);
    }

    async publish(id: string): Promise<Live> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        await liveRepo.update(id, {
            status: LiveStatus.SCHEDULED,
            canceledAt: null,
        });

        const publishedLive = await liveRepo.findOne({
            where: {
                id,
            },
            relations: {
                record: true,
            }
        });

        if (!publishedLive) return null;

        return this.liveEntityMapper.toDomain(publishedLive);
    }

    async getLivesByTimeframe(timeframe: Timeframe): Promise<Live[]> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const now = new Date();

        const lives = timeframe === "future" ?
            await liveRepo.find({
                where: {
                    status: LiveStatus.SCHEDULED,
                    airsAt: MoreThanOrEqual(now)
                }
            })
            :
            await liveRepo.find({
                where: {
                    status: LiveStatus.ONGOING,
                }
            });

        return lives.map((live) => this.liveEntityMapper.toDomain(live));
    }

    async markAsOngoing(id: string): Promise<Live> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);

        const liveToUpdate = await liveRepo.findOne({
            where: {
                id,
            },
            relations: {
                record: true,
            }
        });

        if (!liveToUpdate) return null;

        liveToUpdate.status = LiveStatus.ONGOING;
        const updatedLive = await liveRepo.save(liveToUpdate);

        return this.liveEntityMapper.toDomain(updatedLive);
    }

    async getLivesByStatusAndDate(payload: GetLivesByStatusAndDateInput): Promise<Live[]> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const {filter} = payload
        const {status, date} = filter;

        const lives = await liveRepo.find({
            where: {
                status: status ? status : null,
                airsAt: date ? MoreThanOrEqual(date) : null
            },
            order: {
                createdAt: "DESC"
            },
            relations: {
                category: true,
                record: true,
                group: true
            }
        });

        return lives.map((live) => this.liveEntityMapper.toDomain(live));
    }

    async addUserInterestToLive(payload: AddUserInterestToLiveInput): Promise<void> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const userRepo = this.entityManager.getRepository(UserEntity);
        const {liveId, user} = payload;

        const liveToSave = await liveRepo.findOne({
            where: {
                id: liveId,
            },
            relations: {
                interestedUsers: true,
                record: true,
            }
        });

        if (!liveToSave) return;

        const userToSave = await userRepo.findOne({
            where: {
                id: user.id,
            }
        });

        if (!userToSave) return;

        liveToSave.interestedUsers = [...liveToSave.interestedUsers, userToSave];

        await liveRepo.save(liveToSave);
    }

    async removeUserInterestFromLive(payload: RemoveUserInterestFromLiveInput): Promise<void> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const userRepo = this.entityManager.getRepository(UserEntity);

        const {user, liveId} = payload

        const liveToRemoveInterest = await liveRepo.findOne({
            where: {
                id: payload.liveId,
            },
            relations: {
                interestedUsers: true,
                record: true,
            }
        });

        if (!liveToRemoveInterest) return;

        liveToRemoveInterest.interestedUsers = liveToRemoveInterest.interestedUsers
            .filter((interestedUser) => interestedUser.id !== user.id);

        await liveRepo.save(liveToRemoveInterest);
    }

    async saveRecord(payload: { roomId: string; record: Record }): Promise<Record> {
        const {record, roomId} = payload;
        const liveRepo = this.entityManager.getRepository(LiveEntity);
        const recordRepo = this.entityManager.getRepository(RecordEntity);

        const live = await liveRepo.findOne({
            where: {
                roomId,
            },
        });

        if (!live) return null;

        live.record = {
            id: record.id,
            title: "",
            description: "",
            thumbnail: "",
            fileUrl: record.props.fileUrl,
            status: record.props.status,
        };

        await liveRepo.save(live);

        return record;
    }

    async getLivesByGroupOrModuleId(id: string): Promise<Live[]> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);

        const lives = await liveRepo.find({
            where: {
                groupId: id,
            },
            order: {
                createdAt: "DESC"
            },
            relations: {
                category: true,
                record: true,
                group: true
            }
        });

        return lives.map((live) => this.liveEntityMapper.toDomain(live));
    }

    async getInterestedUsersIds(liveId: string): Promise<string[]> {
        const liveRepo = this.entityManager.getRepository(LiveEntity);

        const ids = await liveRepo.createQueryBuilder("live")
            .leftJoinAndSelect("live.interestedUsers", "user")
            .where("live.id = :id", {id: liveId})
            .getMany();

        return ids.map((live) => live.interestedUsers.map((user) => user.id)).flat();
    }
}
