import {Expose, plainToClass} from "class-transformer";
import {IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl} from "class-validator";

export class UpdateResourceCommand {

    @Expose()
    @IsString()
    @IsNotEmpty()
    title: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    description: string;

    @Expose()
    @IsString()
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    image: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    groupId: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @Expose()
    @IsOptional()
    @IsBoolean()
    isModule?: boolean;

    static setProperties(cmd: UpdateResourceCommand): UpdateResourceCommand {
        return plainToClass(UpdateResourceCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}