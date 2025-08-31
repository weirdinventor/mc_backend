import {Expose, plainToClass} from "class-transformer";
import {IsString} from "class-validator";

export class ReactionCommand {

    @Expose()
    @IsString()
    emoji: string;


    static setProperties(cmd: ReactionCommand): ReactionCommand {
        return plainToClass(ReactionCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}