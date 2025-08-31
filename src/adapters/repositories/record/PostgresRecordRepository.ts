import {RecordRepository} from "../../../core/write/domain/repositories/RecordRepository";
import {EntityManager, IsNull, Not} from "typeorm";
import {RecordEntityMapper} from "./mappers/RecordEntityMapper";
import {Record} from "../../../core/write/domain/aggregates/Record";
import {RecordEntity} from "../entities/RecordEntity";
import {UpdateRecordInput} from "../../../core/write/usecases/record/UpdateRecord";
import {LiveEntity} from "../entities/LiveEntity";
import {GetAllRecordsInput} from "../../../core/write/usecases/record/GetAllRecords";


export class PostgresRecordRepository implements RecordRepository {

    private readonly _recordEntityMapper: RecordEntityMapper

    constructor(
        private readonly _entityManager: EntityManager
    ) {
        this._recordEntityMapper = new RecordEntityMapper(_entityManager);
    }

    async getById(id: string): Promise<Record> {
        const liveRepo = this._entityManager.getRepository(LiveEntity);
        const recordEntity = await liveRepo.findOne({
            where: {
               record: {
                   id
               }
            },
            relations: {
                record: true,
                category: true
            }
        })

        if (!recordEntity) return null;

        return this._recordEntityMapper.toDomain(recordEntity.record, {
            category: recordEntity.category
        })
    }


    async getAll(payload: GetAllRecordsInput): Promise<Record[]> {
        const liveRepo = this._entityManager.getRepository(LiveEntity);
        const {groupId} = payload;

        const liveEntities = await liveRepo.find({
            where: {
                groupId: groupId ? groupId : null,
                record: Not(IsNull())
            },
            relations: {
                record: true,
                category: true,
            }
        });

        return liveEntities.map((record) => {
            return this._recordEntityMapper.toDomain(record.record, {
                category: record.category
            })
        });

    }

    async create(record: Record): Promise<Record> {
        const recordRepo = this._entityManager.getRepository(RecordEntity)
        const recordEntity = this._recordEntityMapper.fromDomain(record)

        const savedRecord = await recordRepo.save(recordEntity)

        return this._recordEntityMapper.toDomain(savedRecord)
    }

    async update(payload: UpdateRecordInput): Promise<Record> {
        const {data} = payload
        const recordRepo = this._entityManager.getRepository(RecordEntity)
        const recordEntity = await recordRepo.findOne({
            where: {
                id: data.id
            }
        })

        if (!recordEntity) return null;

        recordEntity.title = data.title;
        recordEntity.description = data.description;
        recordEntity.status = data.status;
        recordEntity.thumbnail = data.thumbnail;

        const updatedRecord = await recordRepo.save(recordEntity);

        return this._recordEntityMapper.toDomain(updatedRecord);
    }
}