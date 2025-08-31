import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";


@injectable()
export class StopHlsStreamCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    id: string;


    static setProperties(cmd: StopHlsStreamCommand): StopHlsStreamCommand {
        return plainToClass(StopHlsStreamCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}