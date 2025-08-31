import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";
import {injectable} from "inversify";

@injectable()
export class AddUserInterestToLiveCommand {
    @Expose()
    @IsString()
    @IsNotEmpty()
    liveId: string;

    static setProperties(cmd: AddUserInterestToLiveCommand): AddUserInterestToLiveCommand {
        return plainToClass(AddUserInterestToLiveCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
