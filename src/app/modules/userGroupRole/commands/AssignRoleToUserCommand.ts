import {Expose, plainToClass} from "class-transformer";
import {ArrayUnique, IsArray, IsNotEmpty, IsString} from "class-validator";
import {injectable} from "inversify";

@injectable()
export class AssignRoleToUserCommand {
    @Expose()
    @IsString()
    @IsNotEmpty()
    userId: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    groupId: string;

    @Expose()
    @IsString({each: true})
    @IsNotEmpty()
    @IsArray()
    @ArrayUnique()
    roleIds: string[];

    static setProperties(cmd: AssignRoleToUserCommand): AssignRoleToUserCommand {
        return plainToClass(AssignRoleToUserCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
