import {injectable} from "inversify";
import {IsEmail, IsString} from "class-validator";
import {Expose, plainToClass} from "class-transformer";

@injectable()
export class SignupCommand {

    @Expose()
    @IsEmail()
    email: string;

    @Expose()
    @IsString()
    password: string;



    static setProperties(cmd: SignupCommand): SignupCommand {
        return plainToClass(SignupCommand, cmd, {
            excludeExtraneousValues: true
        })
    }
}