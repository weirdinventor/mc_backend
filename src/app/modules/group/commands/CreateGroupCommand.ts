import { Expose, plainToClass } from "class-transformer";
import {ArrayUnique, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl} from "class-validator";
import { injectable } from "inversify";
import { GroupPermission } from "../../../../core/write/domain/types/GroupPermissions";
import {AccessLevel} from "../../../../core/write/domain/types/AccessLevel";

@injectable()
export class CreateGroupCommand {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  subject: string;
  
  @Expose()
  @IsNotEmpty()
  coverImage?: string;

  @Expose()
  @IsNotEmpty()
  thumbnail?: string;

  @Expose()
  permissions?: GroupPermission[];

  @Expose()
  @IsEnum(AccessLevel)
  @IsOptional()
  accessLevel?: AccessLevel

  static setProperties(cmd: CreateGroupCommand): CreateGroupCommand {
    return plainToClass(CreateGroupCommand, cmd, {
      excludeExtraneousValues: true,
    });
  }
}
