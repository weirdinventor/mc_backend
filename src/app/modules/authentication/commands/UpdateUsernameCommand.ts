import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";


@injectable()
export class UpdateUsernameCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    username: string;


    static setProperties(cmd: UpdateUsernameCommand): UpdateUsernameCommand {
        return plainToClass(UpdateUsernameCommand, cmd, {
            excludeExtraneousValues: true
        })
    }
}