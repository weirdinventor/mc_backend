import {IsEnum, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Expose, plainToClass} from "class-transformer";
import {RecordStatus} from "../../../../core/write/domain/types/RecordStatus";

export class UpdateRecordCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    title: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Expose()
    @IsOptional()
    thumbnail?: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @IsEnum(RecordStatus)
    status: RecordStatus;

    static setProperties(cmd: UpdateRecordCommand): UpdateRecordCommand {
        return plainToClass(UpdateRecordCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}