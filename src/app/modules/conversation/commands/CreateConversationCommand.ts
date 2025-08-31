import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";


@injectable()
export class CreateConversationCommand {
    
    @Expose()
    @IsString()
    @IsNotEmpty()
    participant: string;

    static setProperties(cmd: CreateConversationCommand): CreateConversationCommand {
        return plainToClass(CreateConversationCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}