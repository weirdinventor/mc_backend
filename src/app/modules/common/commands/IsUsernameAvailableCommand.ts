import {IsString} from "class-validator";
import {Expose, plainToClass} from "class-transformer";

export class IsUsernameAvailableCommand {

    @Expose()
    @IsString()
    username: string;

    static setProperties(cmd: IsUsernameAvailableCommand):  IsUsernameAvailableCommand {
        return plainToClass(IsUsernameAvailableCommand, cmd, { excludeExtraneousValues: true });
    }
}
