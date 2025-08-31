import {injectable} from "inversify";
import {IsEmail, IsPhoneNumber, IsString} from "class-validator";
import {Expose, plainToClass} from "class-transformer";

@injectable()
export class SignInCommand {

    @Expose()
    @IsEmail()
    email: string;

    @Expose()
    @IsString()
    password: string;



    static setProperties(cmd: SignInCommand): SignInCommand {
        return plainToClass(SignInCommand, cmd, {
            excludeExtraneousValues: true
        })
    }
}