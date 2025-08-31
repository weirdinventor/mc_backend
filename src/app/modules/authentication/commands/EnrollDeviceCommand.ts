import {injectable} from "inversify";
import {IsEnum, IsNotEmpty, IsString} from "class-validator";
import {Expose, plainToClass} from "class-transformer";
import {Os} from "../../../../core/write/domain/types/Os";

@injectable()
export class EnrollDeviceCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    registrationToken : string

    @Expose()
    @IsEnum(Os)
    os : Os

    static setProperties(cmd: EnrollDeviceCommand): EnrollDeviceCommand {
        return plainToClass(EnrollDeviceCommand, cmd, {
            excludeExtraneousValues: true
        })
    }
}