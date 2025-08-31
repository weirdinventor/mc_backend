import {Expose, plainToClass} from "class-transformer";
import {IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl} from "class-validator";
import {injectable} from "inversify";
import {GroupPermission} from "../../../../core/write/domain/types/GroupPermissions";
import {AccessLevel} from "../../../../core/write/domain/types/AccessLevel";

@injectable()
export class UpdateGroupCommand {
    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;


    @Expose()
    @IsString()
    @IsNotEmpty()
    subject: string;

    @Expose()
    @IsNotEmpty()
    coverImage?: string;

    @Expose()
    @IsNotEmpty()
    thumbnail?: string;

    @Expose()
    permissions?: GroupPermission[];

    @Expose()
    @IsEnum(AccessLevel)
    @IsOptional()
    accessLevel?: AccessLevel

    static setProperties(cmd: UpdateGroupCommand): UpdateGroupCommand {
        return plainToClass(UpdateGroupCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
