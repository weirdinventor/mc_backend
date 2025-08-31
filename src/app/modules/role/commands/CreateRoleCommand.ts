import {Expose, plainToClass} from "class-transformer";
import {IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {injectable} from "inversify";
import {RolePermission} from "../../../../core/write/domain/types/RolePermissions";

@injectable()
export class CreateRoleCommand {
    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    groupId: string;

    @Expose()
    @IsOptional()
    @IsEnum(RolePermission, {each: true})
    permissions?: RolePermission[];

    @Expose()
    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;

    static setProperties(cmd: CreateRoleCommand): CreateRoleCommand {
        return plainToClass(CreateRoleCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
