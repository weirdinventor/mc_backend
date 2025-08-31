import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";


@injectable()
export class ChangePasswordCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    previousPassword: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;


    static setProperties(cmd: ChangePasswordCommand): ChangePasswordCommand {
        return plainToClass(ChangePasswordCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}