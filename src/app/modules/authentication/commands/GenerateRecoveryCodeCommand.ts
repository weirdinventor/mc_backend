import {IsEmail} from "class-validator";
import {Expose, plainToClass} from "class-transformer";

export class GenerateRecoveryCodeCommand {

  @Expose()
  @IsEmail()
  email: string;

  static setProperties(cmd: GenerateRecoveryCodeCommand):  GenerateRecoveryCodeCommand {
    return plainToClass( GenerateRecoveryCodeCommand, cmd, { excludeExtraneousValues: true });
  }
}
