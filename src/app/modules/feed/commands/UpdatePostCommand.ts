import {IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl} from "class-validator";
import {Expose, plainToClass} from "class-transformer";
import {PostMediaType} from "../../../../core/write/domain/types/PostMediaType";

export class UpdatePostCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    text: string;

    @Expose()
    @IsOptional()
    mediaUrl?: string;

    @Expose()
    @IsOptional()
    thumbnail?: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @IsEnum(PostMediaType)
    mediaType: PostMediaType;

    @Expose()
    @IsOptional()
    @IsString()
    liveCategoryId?: string;

    static setProperties(cmd: UpdatePostCommand): UpdatePostCommand {
        return plainToClass(UpdatePostCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
