import {AggregateRoot} from "../entities/AggregateRoot";
import {v4} from "uuid";
import {RecordStatus} from "../types/RecordStatus";
import {RecordCreated} from "../../../../messages/events/record/RecordCreated";
import {Handle} from "../../../../messages/utilsAndConfugrations/decorators/Handle";
import {RecordUpdated} from "../../../../messages/events/record/RecordUpdated";
import {LiveCategoryEntity} from "../../../../adapters/repositories/entities/LiveCategoryEntity";

export interface RecordProperties {
    id: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    status: RecordStatus;
    fileUrl: string;
    category?: LiveCategoryEntity;
    createdAt?: Date;
    updatedAt?: Date;
}


export class Record extends AggregateRoot<RecordProperties> {

    static restore(props: RecordProperties) {
        return new Record(props);
    }


    static create(
        payload: {
            fileUrl: string;
        }
    ) {

        const record = new Record({
            id: v4(),
            status: RecordStatus.DRAFT,
            fileUrl: payload.fileUrl
        })

        record.applyChange(
            new RecordCreated({
                fileUrl: record.props.fileUrl,
                status: record.props.status,
            }),
        )

        return record;
    }

    @Handle(RecordCreated)
    private applyRecordCreated(event: RecordCreated) {
        this.props.fileUrl = event.props.fileUrl;
        this.props.status = event.props.status
    }

    update = (payload: {
        title: string;
        description: string;
        thumbnail?: string;
        status: RecordStatus;
    }) => {

        this.applyChange(
            new RecordUpdated(payload),
        )

        return this;
    };

    @Handle(RecordUpdated)
    private applyRecordUpdated(event: RecordUpdated) {
        this.props.title = event.props.title;
        this.props.description = event.props.description;
        this.props.thumbnail = event.props.thumbnail;
        this.props.status = event.props.status;
    }
}