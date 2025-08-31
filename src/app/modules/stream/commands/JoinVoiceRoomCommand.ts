import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";


@injectable()
export class JoinVoiceRoomCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    groupId: string;


    static setProperties(cmd: JoinVoiceRoomCommand): JoinVoiceRoomCommand {
        return plainToClass(JoinVoiceRoomCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}