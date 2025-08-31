import {Expose, plainToClass, Transform} from "class-transformer";
import {IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinDate} from "class-validator";
import {injectable} from "inversify";
import {AccessLevel} from "../../../../core/write/domain/types/AccessLevel";

// Request rules

@injectable()
export class CreateLiveCommand {
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
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @Expose()
    @IsOptional()
    @IsString()
    groupId: string;

    @Expose()
    @IsDate()
    @Transform(({value}) => new Date(value))
    @MinDate(new Date())
    airsAt: Date | null;

    @Expose()
    @IsBoolean()
    @IsNotEmpty()
    isModule: boolean;

    static setProperties(cmd: CreateLiveCommand): CreateLiveCommand {
        return plainToClass(CreateLiveCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
