import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";


@injectable()
export class JoinHlsStreamCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    liveId: string;


    static setProperties(cmd: JoinHlsStreamCommand): JoinHlsStreamCommand {
        return plainToClass(JoinHlsStreamCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}