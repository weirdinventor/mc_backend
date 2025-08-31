import {IsEmail, IsString} from "class-validator";
import {Expose, plainToClass} from "class-transformer";

export class IsEmailAvailableCommand {

    @Expose()
    @IsEmail()
    email: string;

    static setProperties(cmd: IsEmailAvailableCommand): IsEmailAvailableCommand {
        return plainToClass(IsEmailAvailableCommand, cmd, {excludeExtraneousValues: true});
    }
}
