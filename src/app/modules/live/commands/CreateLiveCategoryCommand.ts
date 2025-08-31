import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsString} from "class-validator";
import {injectable} from "inversify";

@injectable()
export class CreateLiveCategoryCommand {
    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;

    static setProperties(cmd: CreateLiveCategoryCommand): CreateLiveCategoryCommand {
        return plainToClass(CreateLiveCategoryCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}
