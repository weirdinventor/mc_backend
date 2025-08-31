import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";


@injectable()
export class StartHlsStreamCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    liveId: string;


    static setProperties(cmd: StartHlsStreamCommand): StartHlsStreamCommand {
        return plainToClass(StartHlsStreamCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}