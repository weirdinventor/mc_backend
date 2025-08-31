import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";
import {injectable} from "inversify";

@injectable()
export class UpdateLiveCategoryCommand {
    
    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    static setProperties(cmd: UpdateLiveCategoryCommand): UpdateLiveCategoryCommand {
        return plainToClass(UpdateLiveCategoryCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
