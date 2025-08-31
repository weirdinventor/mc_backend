import {IsEmail, IsString, IsUUID} from "class-validator";
import {Expose, plainToClass} from "class-transformer";

export class ResetPasswordCommand {

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  recoveryCode: string;

  @Expose()
  @IsString()
  password: string;

  static setProperties(cmd: ResetPasswordCommand):  ResetPasswordCommand {
    return plainToClass( ResetPasswordCommand, cmd, { excludeExtraneousValues: true });
  }
}
