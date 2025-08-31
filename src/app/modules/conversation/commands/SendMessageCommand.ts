import {injectable} from "inversify";
import {Expose, plainToClass, Type} from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString, IsUrl,
    ValidateNested
} from "class-validator";
import {MessageType} from "../../../../core/write/domain/types/MessageType";
import {Media, MediaType} from "../../../../core/write/domain/types/MediaType";


class ValidationMedia {

    @Expose()
    @IsString()
    @IsUrl()
    url: string;

    @Expose()
    @IsIn(["image", "video", "audio", "document"])
    type: MediaType;
}

@injectable()
export class SendMessageCommand {


    @Expose()
    @IsString()
    @IsOptional()
    text?: string;

    @Expose()
    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    @ValidateNested({
        each: true,
        message: "Media must contain url and type (image, video, audio, document)"
    })
    @Type(() => ValidationMedia)
    media?: Media[];

    @Expose()
    @IsString()
    @IsOptional()
    @IsUrl()
    audio?: string;

    @Expose()
    @IsNotEmpty()
    @IsArray()
    @IsEnum(MessageType, {each: true})
    type: MessageType[];

    @Expose()
    @IsNotEmpty()
    @IsString()
    conversation: string;

    static setProperties(cmd: SendMessageCommand): SendMessageCommand {
        return plainToClass(SendMessageCommand, cmd, {
            excludeExtraneousValues: true,
        });
    }
}