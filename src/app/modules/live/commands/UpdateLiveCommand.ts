import {Expose, plainToClass} from "class-transformer";
import {IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString} from "class-validator";
import {injectable} from "inversify";
import {LiveStatus} from "../../../../core/write/domain/types/LiveStatus";
import {AccessLevel} from "../../../../core/write/domain/types/AccessLevel";

@injectable()
export class UpdateLiveCommand {
    @Expose()
    @IsString()
    title: string;

    @Expose()
    @IsString()
    description: string;

    @Expose()
    @IsString()
    coverImage: string | null;

    @Expose()
    @IsNumber()
    duration: number;

    @Expose()
    @IsEnum(AccessLevel)
    accessLevel: AccessLevel;

    @Expose()
    @IsDateString()
    airsAt: Date | null;

    @Expose()
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @Expose()
    @IsEnum(LiveStatus)
    status: LiveStatus;

    static setProperties(cmd: UpdateLiveCommand): UpdateLiveCommand {
        return plainToClass(UpdateLiveCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
