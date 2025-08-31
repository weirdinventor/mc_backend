import {injectable} from "inversify";
import {Expose, plainToClass} from "class-transformer";
import {IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested} from "class-validator";


@injectable()
export class SearchGroupCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    searchQuery: string;


    @Expose()
    @IsNumber()
    page: number;

    static setProperties(cmd: SearchGroupCommand): SearchGroupCommand {
        return plainToClass(SearchGroupCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}