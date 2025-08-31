import {injectable} from "inversify";
import {
    IsEmail, IsEnum,
    IsISO8601,
    IsNotEmpty,
    IsPhoneNumber,
    IsString,
} from "class-validator";
import {Expose, plainToClass} from "class-transformer";
import {UserGender} from "../../../../core/write/domain/types/UserGender";

@injectable()
export class CreateProfileCommand {
    @Expose()
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    lastname: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    username: string;

    @Expose()
    @IsEnum(UserGender)
    gender: UserGender;

    static setProperties(cmd: CreateProfileCommand): CreateProfileCommand {
        return plainToClass(CreateProfileCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
