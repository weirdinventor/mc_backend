import {Expose, plainToClass} from "class-transformer";
import {IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {injectable} from "inversify";
import {RolePermission} from "../../../../core/write/domain/types/RolePermissions";

@injectable()
export class UpdateRoleCommand {
    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    @Expose()
    @IsOptional()
    @IsEnum(RolePermission, {each: true})
    permissions?: RolePermission[];

    static setProperties(cmd: UpdateRoleCommand): UpdateRoleCommand {
        return plainToClass(UpdateRoleCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
